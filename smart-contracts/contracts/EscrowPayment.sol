// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EscrowPayment
 * @dev 供应链金融中的托管支付合约
 */
contract EscrowPayment {
    // 托管状态
    enum EscrowStatus {
        Created,
        Funded,
        Completed,
        Cancelled,
        Disputed
    }

    // 托管结构
    struct Escrow {
        uint256 id;
        address payable buyer;
        address payable seller;
        address payable arbitrator;
        uint256 amount;
        uint256 createdAt;
        uint256 deadline;
        EscrowStatus status;
        string termsHash; // 条款哈希
        bool buyerApproved;
        bool sellerApproved;
    }

    // 事件
    event EscrowCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowFunded(uint256 indexed id, uint256 amount);
    event EscrowCompleted(uint256 indexed id, uint256 amount);
    event EscrowCancelled(uint256 indexed id, uint256 amount);
    event EscrowDisputed(uint256 indexed id, address indexed disputer);
    event EscrowResolved(uint256 indexed id, address indexed resolver, uint256 buyerAmount, uint256 sellerAmount);

    // 托管映射
    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    // 修饰器：仅参与者
    modifier onlyParticipant(uint256 _escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.buyer || 
            msg.sender == escrow.seller || 
            msg.sender == escrow.arbitrator,
            "Not a participant"
        );
        _;
    }

    // 修饰器：仅买家
    modifier onlyBuyer(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].buyer, "Not the buyer");
        _;
    }

    // 修饰器：仅卖家
    modifier onlySeller(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].seller, "Not the seller");
        _;
    }

    // 修饰器：仅仲裁者
    modifier onlyArbitrator(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].arbitrator, "Not the arbitrator");
        _;
    }

    // 创建托管
    function createEscrow(
        address payable _seller,
        address payable _arbitrator,
        uint256 _deadline,
        string memory _termsHash
    ) external payable returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_arbitrator != address(0), "Invalid arbitrator address");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value > 0, "Amount must be greater than 0");

        uint256 escrowId = nextEscrowId++;
        
        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: payable(msg.sender),
            seller: _seller,
            arbitrator: _arbitrator,
            amount: msg.value,
            createdAt: block.timestamp,
            deadline: _deadline,
            status: EscrowStatus.Created,
            termsHash: _termsHash,
            buyerApproved: false,
            sellerApproved: false
        });

        emit EscrowCreated(escrowId, msg.sender, _seller, msg.value);
        return escrowId;
    }

    // 资金托管（买家存入资金）
    function fundEscrow(uint256 _escrowId) external payable onlyBuyer(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Created, "Escrow not in Created state");
        require(msg.value == escrow.amount, "Incorrect funding amount");

        escrow.status = EscrowStatus.Funded;
        emit EscrowFunded(_escrowId, msg.value);
    }

    // 买家确认完成
    function buyerApprove(uint256 _escrowId) external onlyBuyer(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        
        escrow.buyerApproved = true;
        
        if (escrow.sellerApproved) {
            _completeEscrow(_escrowId);
        }
    }

    // 卖家确认完成
    function sellerApprove(uint256 _escrowId) external onlySeller(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        
        escrow.sellerApproved = true;
        
        if (escrow.buyerApproved) {
            _completeEscrow(_escrowId);
        }
    }

    // 完成托管（内部函数）
    function _completeEscrow(uint256 _escrowId) internal {
        Escrow storage escrow = escrows[_escrowId];
        escrow.status = EscrowStatus.Completed;
        
        // 向卖家转账
        (bool success, ) = escrow.seller.call{value: escrow.amount}("");
        require(success, "Transfer failed");
        
        emit EscrowCompleted(_escrowId, escrow.amount);
    }

    // 取消托管（仅限买家，在卖家未确认前）
    function cancelEscrow(uint256 _escrowId) external onlyBuyer(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(!escrow.sellerApproved, "Seller already approved");
        
        escrow.status = EscrowStatus.Cancelled;
        
        // 向买家退款
        (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
        require(success, "Transfer failed");
        
        emit EscrowCancelled(_escrowId, escrow.amount);
    }

    // 发起争议
    function raiseDispute(uint256 _escrowId) external onlyParticipant(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        
        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(_escrowId, msg.sender);
    }

    // 解决争议（仲裁者）
    function resolveDispute(
        uint256 _escrowId,
        uint256 _buyerAmount,
        uint256 _sellerAmount
    ) external onlyArbitrator(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow not in dispute");
        require(_buyerAmount + _sellerAmount == escrow.amount, "Amounts must sum to escrow amount");
        
        // 分配资金
        if (_buyerAmount > 0) {
            (bool success1, ) = escrow.buyer.call{value: _buyerAmount}("");
            require(success1, "Buyer transfer failed");
        }
        
        if (_sellerAmount > 0) {
            (bool success2, ) = escrow.seller.call{value: _sellerAmount}("");
            require(success2, "Seller transfer failed");
        }
        
        escrow.status = EscrowStatus.Completed;
        emit EscrowResolved(_escrowId, msg.sender, _buyerAmount, _sellerAmount);
    }

    // 获取托管详情
    function getEscrow(uint256 _escrowId) external view returns (
        address buyer,
        address seller,
        address arbitrator,
        uint256 amount,
        uint256 createdAt,
        uint256 deadline,
        EscrowStatus status,
        string memory termsHash,
        bool buyerApproved,
        bool sellerApproved
    ) {
        Escrow storage escrow = escrows[_escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.arbitrator,
            escrow.amount,
            escrow.createdAt,
            escrow.deadline,
            escrow.status,
            escrow.termsHash,
            escrow.buyerApproved,
            escrow.sellerApproved
        );
    }

    // 检查是否过期
    function isExpired(uint256 _escrowId) external view returns (bool) {
        Escrow storage escrow = escrows[_escrowId];
        return block.timestamp > escrow.deadline;
    }
}