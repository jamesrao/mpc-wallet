// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ReceivableNFT
 * @dev 应收账款NFT代币化合约，将应收账款转化为可交易的NFT
 */
contract ReceivableNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // 应收账款状态
    enum ReceivableStatus {
        Created,     // 已创建
        Approved,    // 已审核
        Funded,      // 已融资
        Repaid,      // 已还款
        Defaulted,   // 违约
        Settled      // 已结算
    }

    // 应收账款结构
    struct ReceivableInfo {
        uint256 tokenId;
        address payable supplier;      // 供应商
        address payable buyer;         // 采购方
        address payable financier;     // 资金方（融资后）
        uint256 amount;                // 金额（wei）
        uint256 dueDate;               // 到期日
        uint256 interestRate;          // 年化利率（基点）
        uint256 createdAt;             // 创建时间
        ReceivableStatus status;       // 状态
        string invoiceHash;            // 发票哈希
        string metadataURI;            // 元数据URI
        uint256 fundingAmount;         // 融资金额
        uint256 repaymentAmount;       // 还款金额
        uint256 repaymentDate;         // 还款日期
    }

    // 事件
    event ReceivableCreated(uint256 indexed tokenId, address indexed supplier, uint256 amount, uint256 dueDate);
    event ReceivableApproved(uint256 indexed tokenId, address indexed approver);
    event ReceivableFunded(uint256 indexed tokenId, address indexed financier, uint256 fundingAmount);
    event ReceivableRepaid(uint256 indexed tokenId, uint256 repaymentAmount);
    event ReceivableDefaulted(uint256 indexed tokenId);
    event ReceivableSettled(uint256 indexed tokenId, uint256 settlementAmount);

    // 映射：tokenId => 应收账款信息
    mapping(uint256 => ReceivableInfo) public receivables;
    
    // 审核者列表
    mapping(address => bool) public isApprover;
    
    // 资金方列表
    mapping(address => bool) public isFinancier;

    constructor() ERC721("SupplyChainReceivable", "SCR") Ownable(msg.sender) {
        // 默认添加部署者为审核者
        isApprover[msg.sender] = true;
    }

    /**
     * @dev 创建应收账款NFT
     */
    function createReceivable(
        address _buyer,
        uint256 _amount,
        uint256 _dueDate,
        uint256 _interestRate,
        string memory _invoiceHash,
        string memory _metadataURI
    ) external returns (uint256) {
        require(_buyer != address(0), "Invalid buyer address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(_interestRate <= 1000, "Interest rate too high"); // 最大10%

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // 创建NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _metadataURI);

        // 存储应收账款信息
        receivables[tokenId] = ReceivableInfo({
            tokenId: tokenId,
            supplier: payable(msg.sender),
            buyer: payable(_buyer),
            financier: payable(address(0)),
            amount: _amount,
            dueDate: _dueDate,
            interestRate: _interestRate,
            createdAt: block.timestamp,
            status: ReceivableStatus.Created,
            invoiceHash: _invoiceHash,
            metadataURI: _metadataURI,
            fundingAmount: 0,
            repaymentAmount: 0,
            repaymentDate: 0
        });

        emit ReceivableCreated(tokenId, msg.sender, _amount, _dueDate);
        return tokenId;
    }

    /**
     * @dev 审核应收账款（仅审核者）
     */
    function approveReceivable(uint256 _tokenId) external {
        require(isApprover[msg.sender], "Not an approver");
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        require(receivable.status == ReceivableStatus.Created, "Receivable not in Created state");
        
        receivable.status = ReceivableStatus.Approved;
        emit ReceivableApproved(_tokenId, msg.sender);
    }

    /**
     * @dev 融资应收账款（仅资金方）
     */
    function fundReceivable(uint256 _tokenId) external payable {
        require(isFinancier[msg.sender], "Not a financier");
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        require(receivable.status == ReceivableStatus.Approved, "Receivable not approved");
        require(msg.value > 0, "Funding amount must be greater than 0");
        
        receivable.financier = payable(msg.sender);
        receivable.fundingAmount = msg.value;
        receivable.status = ReceivableStatus.Funded;
        
        // 向供应商转账（扣除平台费用，这里简化处理）
        uint256 platformFee = msg.value * 1 / 100; // 1%平台费
        uint256 supplierAmount = msg.value - platformFee;
        
        (bool success, ) = receivable.supplier.call{value: supplierAmount}("");
        require(success, "Transfer to supplier failed");
        
        // 平台费用暂时保留在合约中，实际应转给平台
        
        emit ReceivableFunded(_tokenId, msg.sender, msg.value);
    }

    /**
     * @dev 还款（仅采购方）
     */
    function repayReceivable(uint256 _tokenId) external payable {
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        require(msg.sender == receivable.buyer, "Only buyer can repay");
        require(receivable.status == ReceivableStatus.Funded, "Receivable not funded");
        require(block.timestamp <= receivable.dueDate, "Receivable is overdue");
        
        // 计算应还款项
        (uint256 principal, uint256 interest) = calculateRepayment(_tokenId);
        uint256 totalRepayment = principal + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment amount");
        
        receivable.repaymentAmount = totalRepayment;
        receivable.repaymentDate = block.timestamp;
        receivable.status = ReceivableStatus.Repaid;
        
        // 向资金方转账
        (bool success, ) = receivable.financier.call{value: totalRepayment}("");
        require(success, "Transfer to financier failed");
        
        // 如有剩余，退回给还款方
        if (msg.value > totalRepayment) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalRepayment}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit ReceivableRepaid(_tokenId, totalRepayment);
    }

    /**
     * @dev 宣布违约（仅资金方）
     */
    function declareDefault(uint256 _tokenId) external {
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        require(msg.sender == receivable.financier, "Only financier can declare default");
        require(receivable.status == ReceivableStatus.Funded, "Receivable not funded");
        require(block.timestamp > receivable.dueDate, "Receivable not yet due");
        
        receivable.status = ReceivableStatus.Defaulted;
        emit ReceivableDefaulted(_tokenId);
    }

    /**
     * @dev 结算违约应收账款（平台或保险方）
     */
    function settleDefault(uint256 _tokenId) external payable {
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        require(receivable.status == ReceivableStatus.Defaulted, "Receivable not in default");
        require(msg.value >= receivable.fundingAmount, "Insufficient settlement amount");
        
        receivable.status = ReceivableStatus.Settled;
        
        // 向资金方支付
        (bool success, ) = receivable.financier.call{value: receivable.fundingAmount}("");
        require(success, "Transfer to financier failed");
        
        emit ReceivableSettled(_tokenId, msg.value);
    }

    /**
     * @dev 计算应还款项
     */
    function calculateRepayment(uint256 _tokenId) public view returns (uint256 principal, uint256 interest) {
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        require(receivable.status == ReceivableStatus.Funded, "Receivable not funded");
        
        principal = receivable.fundingAmount;
        
        uint256 daysElapsed = (block.timestamp - receivable.createdAt) / 1 days;
        interest = (principal * receivable.interestRate * daysElapsed) / (365 * 10000);
    }

    /**
     * @dev 添加审核者
     */
    function addApprover(address _approver) external onlyOwner {
        isApprover[_approver] = true;
    }

    /**
     * @dev 移除审核者
     */
    function removeApprover(address _approver) external onlyOwner {
        isApprover[_approver] = false;
    }

    /**
     * @dev 添加资金方
     */
    function addFinancier(address _financier) external onlyOwner {
        isFinancier[_financier] = true;
    }

    /**
     * @dev 移除资金方
     */
    function removeFinancier(address _financier) external onlyOwner {
        isFinancier[_financier] = false;
    }

    /**
     * @dev 获取应收账款信息
     */
    function getReceivableInfo(uint256 _tokenId) external view returns (
        address supplier,
        address buyer,
        address financier,
        uint256 amount,
        uint256 dueDate,
        uint256 interestRate,
        uint256 createdAt,
        ReceivableStatus status,
        string memory invoiceHash
    ) {
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        return (
            receivable.supplier,
            receivable.buyer,
            receivable.financier,
            receivable.amount,
            receivable.dueDate,
            receivable.interestRate,
            receivable.createdAt,
            receivable.status,
            receivable.invoiceHash
        );
    }

    /**
     * @dev 检查是否逾期
     */
    function isOverdue(uint256 _tokenId) external view returns (bool) {
        require(_exists(_tokenId), "Token does not exist");
        
        ReceivableInfo storage receivable = receivables[_tokenId];
        return block.timestamp > receivable.dueDate;
    }

    /**
     * @dev 获取用户拥有的应收账款NFT列表
     */
    function getUserReceivables(address _user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_user);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_user, i);
        }
        
        return tokenIds;
    }

    // Override required functions
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}