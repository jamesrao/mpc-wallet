const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署智能合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);
  console.log("部署者余额:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 部署托管支付合约
  console.log("正在部署EscrowPayment合约...");
  const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
  const escrowPayment = await EscrowPayment.deploy();
  await escrowPayment.waitForDeployment();
  
  const escrowPaymentAddress = await escrowPayment.getAddress();
  console.log("EscrowPayment合约地址:", escrowPaymentAddress);

  // 部署供应链金融合约
  console.log("正在部署SupplyChainFinance合约...");
  const SupplyChainFinance = await ethers.getContractFactory("SupplyChainFinance");
  const supplyChainFinance = await SupplyChainFinance.deploy();
  await supplyChainFinance.waitForDeployment();
  
  const supplyChainFinanceAddress = await supplyChainFinance.getAddress();
  console.log("SupplyChainFinance合约地址:", supplyChainFinanceAddress);

  console.log("\n=== 部署完成 ===");
  console.log("EscrowPayment合约地址:", escrowPaymentAddress);
  console.log("SupplyChainFinance合约地址:", supplyChainFinanceAddress);
  
  // 保存部署信息到文件
  const fs = require('fs');
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      EscrowPayment: escrowPaymentAddress,
      SupplyChainFinance: supplyChainFinanceAddress
    },
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("部署信息已保存到 deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });