// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @dev 多方签名钱包合约，支持门限签名和多签审批
 */
contract MultiSigWallet {
    // 交易状态
    enum TransactionStatus {
        Pending,
        Approved,
        Rejected,
        Executed
    }

    // 交易结构
    struct Transaction {
        uint256 id;
        address to;
        uint256 value;
        bytes data;
        uint256 approvalCount;
        TransactionStatus status;
        mapping(address => bool) approvals;
        uint256 createdAt;
        uint256 deadline;
    }

    // 所有者列表
    address[] public owners;
    // 所有者映射
    mapping(address => bool) public isOwner;
    // 门限值
    uint256 public threshold;

    // 交易映射
    mapping(uint256 => Transaction) public transactions;
    uint256 public nextTransactionId;

    // 事件
    event Deposit(address indexed sender, uint256 amount);
    event TransactionCreated(uint256 indexed transactionId, address indexed creator, address to, uint256 value);
    event TransactionApproved(uint256 indexed transactionId, address indexed approver);
    event TransactionRejected(uint256 indexed transactionId, address indexed rejector);
    event TransactionExecuted(uint256 indexed transactionId, address indexed executor);
    event OwnerAdded(address indexed newOwner);
    event OwnerRemoved(address indexed removedOwner);
    event ThresholdChanged(uint256 newThreshold);

    // 修饰器：仅所有者
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    // 修饰器：交易存在且未执行
    modifier transactionExists(uint256 _transactionId) {
        require(_transactionId < nextTransactionId, "Transaction does not exist");
        _;
    }

    // 修饰器：交易未执行
    modifier notExecuted(uint256 _transactionId) {
        require(transactions[_transactionId].status != TransactionStatus.Executed, "Transaction already executed");
        _;
    }

    /**
     * @dev 构造函数
     * @param _owners 所有者列表
     * @param _threshold 门限值（需要多少签名才能执行交易）
     */
    constructor(address[] memory _owners, uint256 _threshold) {
        require(_owners.length > 0, "At least one owner required");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        threshold = _threshold;
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    /**
     * @dev 创建交易
     * @param _to 收款地址
     * @param _value 转账金额
     * @param _data 调用数据
     * @param _deadline 交易截止时间
     */
    function createTransaction(
        address _to,
        uint256 _value,
        bytes memory _data,
        uint256 _deadline
    ) external onlyOwner returns (uint256) {
        require(_to != address(0), "Invalid recipient address");
        require(_value <= address(this).balance, "Insufficient balance");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 transactionId = nextTransactionId++;
        Transaction storage txn = transactions[transactionId];
        
        txn.id = transactionId;
        txn.to = _to;
        txn.value = _value;
        txn.data = _data;
        txn.approvalCount = 0;
        txn.status = TransactionStatus.Pending;
        txn.createdAt = block.timestamp;
        txn.deadline = _deadline;

        // 创建者自动批准
        txn.approvals[msg.sender] = true;
        txn.approvalCount = 1;

        emit TransactionCreated(transactionId, msg.sender, _to, _value);
        return transactionId;
    }

    /**
     * @dev 批准交易
     * @param _transactionId 交易ID
     */
    function approveTransaction(uint256 _transactionId) 
        external 
        onlyOwner 
        transactionExists(_transactionId) 
        notExecuted(_transactionId) 
    {
        Transaction storage txn = transactions[_transactionId];
        require(!txn.approvals[msg.sender], "Transaction already approved by this owner");
        require(txn.status == TransactionStatus.Pending, "Transaction not pending");
        require(block.timestamp <= txn.deadline, "Transaction deadline passed");

        txn.approvals[msg.sender] = true;
        txn.approvalCount++;

        emit TransactionApproved(_transactionId, msg.sender);

        // 检查是否达到门限
        if (txn.approvalCount >= threshold) {
            txn.status = TransactionStatus.Approved;
        }
    }

    /**
     * @dev 拒绝交易
     * @param _transactionId 交易ID
     */
    function rejectTransaction(uint256 _transactionId) 
        external 
        onlyOwner 
        transactionExists(_transactionId) 
        notExecuted(_transactionId) 
    {
        Transaction storage txn = transactions[_transactionId];
        require(txn.status == TransactionStatus.Pending, "Transaction not pending");

        txn.status = TransactionStatus.Rejected;
        emit TransactionRejected(_transactionId, msg.sender);
    }

    /**
     * @dev 执行交易
     * @param _transactionId 交易ID
     */
    function executeTransaction(uint256 _transactionId) 
        external 
        onlyOwner 
        transactionExists(_transactionId) 
        notExecuted(_transactionId) 
    {
        Transaction storage txn = transactions[_transactionId];
        require(txn.status == TransactionStatus.Approved, "Transaction not approved");
        require(block.timestamp <= txn.deadline, "Transaction deadline passed");

        txn.status = TransactionStatus.Executed;

        // 执行交易
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "Transaction execution failed");

        emit TransactionExecuted(_transactionId, msg.sender);
    }

    /**
     * @dev 添加所有者（需要达到门限的现有所有者批准）
     * @param _newOwner 新所有者地址
     */
    function addOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        require(!isOwner[_newOwner], "Already an owner");

        isOwner[_newOwner] = true;
        owners.push(_newOwner);

        emit OwnerAdded(_newOwner);
    }

    /**
     * @dev 移除所有者（需要达到门限的现有所有者批准）
     * @param _ownerToRemove 要移除的所有者地址
     */
    function removeOwner(address _ownerToRemove) external onlyOwner {
        require(isOwner[_ownerToRemove], "Not an owner");
        require(owners.length > 1, "Cannot remove last owner");
        require(owners.length - 1 >= threshold, "Threshold would be too high");

        isOwner[_ownerToRemove] = false;

        // 从数组中移除
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        emit OwnerRemoved(_ownerToRemove);
    }

    /**
     * @dev 修改门限值
     * @param _newThreshold 新门限值
     */
    function changeThreshold(uint256 _newThreshold) external onlyOwner {
        require(_newThreshold > 0 && _newThreshold <= owners.length, "Invalid threshold");
        threshold = _newThreshold;
        emit ThresholdChanged(_newThreshold);
    }

    /**
     * @dev 获取交易详情
     */
    function getTransaction(uint256 _transactionId) external view returns (
        address to,
        uint256 value,
        bytes memory data,
        uint256 approvalCount,
        TransactionStatus status,
        uint256 createdAt,
        uint256 deadline
    ) {
        Transaction storage txn = transactions[_transactionId];
        return (
            txn.to,
            txn.value,
            txn.data,
            txn.approvalCount,
            txn.status,
            txn.createdAt,
            txn.deadline
        );
    }

    /**
     * @dev 检查所有者是否已批准特定交易
     */
    function isApproved(uint256 _transactionId, address _owner) external view returns (bool) {
        return transactions[_transactionId].approvals[_owner];
    }

    /**
     * @dev 获取所有者列表
     */
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    /**
     * @dev 获取钱包余额
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev 检查交易是否可执行
     */
    function canExecute(uint256 _transactionId) external view returns (bool) {
        Transaction storage txn = transactions[_transactionId];
        return txn.status == TransactionStatus.Approved && 
               block.timestamp <= txn.deadline;
    }
}