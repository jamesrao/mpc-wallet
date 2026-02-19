const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowPayment", function () {
  let EscrowPayment, escrowPayment, owner, seller, buyer, arbitrator;
  const amount = ethers.utils.parseEther("1.0");
  const deadline = Math.floor(Date.now() / 1000) + 86400; // 1天后

  beforeEach(async function () {
    [owner, seller, buyer, arbitrator] = await ethers.getSigners();
    
    EscrowPayment = await ethers.getContractFactory("EscrowPayment");
    escrowPayment = await EscrowPayment.deploy();
    await escrowPayment.deployed();
  });

  describe("合约部署", function () {
    it("应该成功部署合约", async function () {
      expect(escrowPayment.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("应该设置正确的合约所有者", async function () {
      expect(await escrowPayment.owner()).to.equal(owner.address);
    });
  });

  describe("创建托管合约", function () {
    it("应该成功创建托管合约", async function () {
      const tx = await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        deadline,
        { value: amount }
      );

      await expect(tx)
        .to.emit(escrowPayment, "EscrowCreated")
        .withArgs(1, seller.address, buyer.address, arbitrator.address, amount, deadline);

      const escrow = await escrowPayment.getEscrow(1);
      expect(escrow.seller).to.equal(seller.address);
      expect(escrow.buyer).to.equal(buyer.address);
      expect(escrow.arbitrator).to.equal(arbitrator.address);
      expect(escrow.amount).to.equal(amount);
      expect(escrow.deadline).to.equal(deadline);
      expect(escrow.status).to.equal(0); // EscrowStatus.Created
    });

    it("应该拒绝零金额的托管", async function () {
      await expect(
        escrowPayment.createEscrow(seller.address, arbitrator.address, deadline, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("应该拒绝过去的截止时间", async function () {
      const pastDeadline = Math.floor(Date.now() / 1000) - 3600;
      await expect(
        escrowPayment.createEscrow(seller.address, arbitrator.address, pastDeadline, { value: amount })
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("确认交付", function () {
    beforeEach(async function () {
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        deadline,
        { value: amount }
      );
    });

    it("买家应该能够确认交付", async function () {
      const tx = await escrowPayment.connect(buyer).confirmDelivery(1);

      await expect(tx)
        .to.emit(escrowPayment, "EscrowCompleted")
        .withArgs(1, seller.address, amount);

      const escrow = await escrowPayment.getEscrow(1);
      expect(escrow.status).to.equal(2); // EscrowStatus.Completed
    });

    it("非买家不能确认交付", async function () {
      await expect(
        escrowPayment.connect(seller).confirmDelivery(1)
      ).to.be.revertedWith("Only buyer can confirm delivery");
    });

    it("不能确认已完成的托管", async function () {
      await escrowPayment.connect(buyer).confirmDelivery(1);
      
      await expect(
        escrowPayment.connect(buyer).confirmDelivery(1)
      ).to.be.revertedWith("Escrow is not in created state");
    });
  });

  describe("仲裁请求", function () {
    beforeEach(async function () {
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        deadline,
        { value: amount }
      );
    });

    it("买卖双方都应该能够请求仲裁", async function () {
      const tx = await escrowPayment.connect(seller).requestArbitration(1);

      await expect(tx)
        .to.emit(escrowPayment, "ArbitrationRequested")
        .withArgs(1, seller.address);

      const escrow = await escrowPayment.getEscrow(1);
      expect(escrow.status).to.equal(1); // EscrowStatus.Arbitration
    });

    it("非买卖双方不能请求仲裁", async function () {
      await expect(
        escrowPayment.connect(arbitrator).requestArbitration(1)
      ).to.be.revertedWith("Only buyer or seller can request arbitration");
    });
  });

  describe("仲裁裁决", function () {
    beforeEach(async function () {
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        deadline,
        { value: amount }
      );
      await escrowPayment.connect(seller).requestArbitration(1);
    });

    it("仲裁员应该能够裁决给卖家", async function () {
      const tx = await escrowPayment.connect(arbitrator).arbitrate(1, true);

      await expect(tx)
        .to.emit(escrowPayment, "EscrowCompleted")
        .withArgs(1, seller.address, amount);

      const escrow = await escrowPayment.getEscrow(1);
      expect(escrow.status).to.equal(2); // EscrowStatus.Completed
    });

    it("仲裁员应该能够裁决给买家", async function () {
      const tx = await escrowPayment.connect(arbitrator).arbitrate(1, false);

      await expect(tx)
        .to.emit(escrowPayment, "EscrowRefunded")
        .withArgs(1, buyer.address, amount);

      const escrow = await escrowPayment.getEscrow(1);
      expect(escrow.status).to.equal(3); // EscrowStatus.Refunded
    });

    it("非仲裁员不能进行裁决", async function () {
      await expect(
        escrowPayment.connect(seller).arbitrate(1, true)
      ).to.be.revertedWith("Only arbitrator can arbitrate");
    });

    it("不能对非仲裁状态的托管进行裁决", async function () {
      await escrowPayment.connect(arbitrator).arbitrate(1, true);
      
      await expect(
        escrowPayment.connect(arbitrator).arbitrate(1, true)
      ).to.be.revertedWith("Escrow is not in arbitration state");
    });
  });

  describe("超时退款", function () {
    it("超时后买家应该能够退款", async function () {
      const shortDeadline = Math.floor(Date.now() / 1000) + 2; // 2秒后
      
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        shortDeadline,
        { value: amount }
      );

      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 3000));

      const tx = await escrowPayment.connect(buyer).refund(1);

      await expect(tx)
        .to.emit(escrowPayment, "EscrowRefunded")
        .withArgs(1, buyer.address, amount);

      const escrow = await escrowPayment.getEscrow(1);
      expect(escrow.status).to.equal(3); // EscrowStatus.Refunded
    });

    it("未超时不能退款", async function () {
      const futureDeadline = Math.floor(Date.now() / 1000) + 86400; // 1天后
      
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        futureDeadline,
        { value: amount }
      );

      await expect(
        escrowPayment.connect(buyer).refund(1)
      ).to.be.revertedWith("Deadline not reached");
    });

    it("非买家不能退款", async function () {
      const shortDeadline = Math.floor(Date.now() / 1000) + 2;
      
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        shortDeadline,
        { value: amount }
      );

      await new Promise(resolve => setTimeout(resolve, 3000));

      await expect(
        escrowPayment.connect(seller).refund(1)
      ).to.be.revertedWith("Only buyer can refund");
    });
  });

  describe("资金转移", function () {
    it("应该正确转移资金给卖家", async function () {
      const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
      
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        deadline,
        { value: amount }
      );

      await escrowPayment.connect(buyer).confirmDelivery(1);

      const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBalance.sub(sellerInitialBalance)).to.equal(amount);
    });

    it("应该正确退款给买家", async function () {
      const buyerInitialBalance = await ethers.provider.getBalance(buyer.address);
      
      const shortDeadline = Math.floor(Date.now() / 1000) + 2;
      
      await escrowPayment.createEscrow(
        seller.address,
        arbitrator.address,
        shortDeadline,
        { value: amount }
      );

      await new Promise(resolve => setTimeout(resolve, 3000));

      await escrowPayment.connect(buyer).refund(1);

      const buyerFinalBalance = await ethers.provider.getBalance(buyer.address);
      // 由于gas费用，余额可能略有减少，但应该接近初始余额
      expect(buyerFinalBalance).to.be.closeTo(buyerInitialBalance, ethers.utils.parseEther("0.01"));
    });
  });
});