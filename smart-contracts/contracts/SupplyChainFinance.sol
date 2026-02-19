// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EscrowPayment.sol";

/**
 * @title SupplyChainFinance
 * @dev 供应链金融代币化合约
 */
contract SupplyChainFinance {
    // 代币化状态
    enum TokenizationStatus {
        Created,
        Funded,
        Repaid,
        Defaulted
    }

    // 发票结构
    struct Invoice {
        uint256 id;
        address payable supplier;
        address payable financier;
        uint256 amount;
        uint256 dueDate;
        uint256 interestRate; // 年化利率，单位：基点（1% = 100基点）
        uint256 createdAt;
        TokenizationStatus status;
        bool approvedBySupplier;
        bool approvedByFinancier;
        string invoiceHash; // 发票哈希
    }

    // 事件
    event InvoiceCreated(uint256 indexed id, address indexed supplier, uint256 amount, uint256 dueDate);
    event InvoiceFunded(uint256 indexed id, address indexed financier, uint256 amount);
    event InvoiceRepaid(uint256 indexed id, uint256 amount, uint256 interest);
    event InvoiceDefaulted(uint256 indexed id);
    event InvoiceSettled(uint256 indexed id, uint256 amount);

    // 发票映射
    mapping(uint256 => Invoice) public invoices;
    uint256 public nextInvoiceId;

    // 代币接口（简单实现）
    address public tokenAddress;

    // 设置代币地址
    function setTokenAddress(address _tokenAddress) external {
        require(tokenAddress == address(0), "Token address already set");
        tokenAddress = _tokenAddress;
    }

    // 创建发票
    function createInvoice(
        uint256 _amount,
        uint256 _dueDate,
        uint256 _interestRate,
        string memory _invoiceHash
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(_interestRate <= 1000, "Interest rate too high"); // 最大10%

        uint256 invoiceId = nextInvoiceId++;
        
        invoices[invoiceId] = Invoice({
            id: invoiceId,
            supplier: payable(msg.sender),
            financier: payable(address(0)),
            amount: _amount,
            dueDate: _dueDate,
            interestRate: _interestRate,
            createdAt: block.timestamp,
            status: TokenizationStatus.Created,
            approvedBySupplier: false,
            approvedByFinancier: false,
            invoiceHash: _invoiceHash
        });

        emit InvoiceCreated(invoiceId, msg.sender, _amount, _dueDate);
        return invoiceId;
    }

    // 供应商确认发票
    function supplierApprove(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(msg.sender == invoice.supplier, "Not the supplier");
        require(invoice.status == TokenizationStatus.Created, "Invoice not in Created state");
        
        invoice.approvedBySupplier = true;
        
        if (invoice.approvedByFinancier) {
            _fundInvoice(_invoiceId);
        }
    }

    // 资金方确认并融资
    function financierApprove(uint256 _invoiceId) external payable {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.status == TokenizationStatus.Created, "Invoice not in Created state");
        require(msg.value == invoice.amount, "Incorrect funding amount");
        
        invoice.financier = payable(msg.sender);
        invoice.approvedByFinancier = true;
        
        if (invoice.approvedBySupplier) {
            _fundInvoice(_invoiceId);
        }
    }

    // 融资发票（内部函数）
    function _fundInvoice(uint256 _invoiceId) internal {
        Invoice storage invoice = invoices[_invoiceId];
        invoice.status = TokenizationStatus.Funded;
        
        // 向供应商转账
        (bool success, ) = invoice.supplier.call{value: invoice.amount}("");
        require(success, "Transfer to supplier failed");
        
        emit InvoiceFunded(_invoiceId, invoice.financier, invoice.amount);
    }

    // 还款
    function repay(uint256 _invoiceId) external payable {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.status == TokenizationStatus.Funded, "Invoice not funded");
        require(block.timestamp <= invoice.dueDate, "Invoice is overdue");
        
        // 计算利息
        uint256 daysElapsed = (block.timestamp - invoice.createdAt) / 1 days;
        uint256 interest = (invoice.amount * invoice.interestRate * daysElapsed) / (365 * 10000);
        uint256 totalRepayment = invoice.amount + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment amount");
        
        // 向资金方转账
        (bool success, ) = invoice.financier.call{value: totalRepayment}("");
        require(success, "Transfer to financier failed");
        
        // 如有剩余，退回给还款方
        if (msg.value > totalRepayment) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalRepayment}("");
            require(refundSuccess, "Refund failed");
        }
        
        invoice.status = TokenizationStatus.Repaid;
        emit InvoiceRepaid(_invoiceId, invoice.amount, interest);
    }

    // 违约处理
    function declareDefault(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.status == TokenizationStatus.Funded, "Invoice not funded");
        require(block.timestamp > invoice.dueDate, "Invoice not yet due");
        require(msg.sender == invoice.financier, "Only financier can declare default");
        
        invoice.status = TokenizationStatus.Defaulted;
        emit InvoiceDefaulted(_invoiceId);
        
        // 这里可以触发保险理赔或其他违约处理逻辑
        // 在实际系统中，可能需要与保险合约交互
    }

    // 结算违约发票（例如通过保险）
    function settleDefault(uint256 _invoiceId) external payable {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.status == TokenizationStatus.Defaulted, "Invoice not in default");
        require(msg.value == invoice.amount, "Incorrect settlement amount");
        
        // 向资金方支付
        (bool success, ) = invoice.financier.call{value: msg.value}("");
        require(success, "Transfer to financier failed");
        
        emit InvoiceSettled(_invoiceId, msg.value);
    }

    // 获取发票详情
    function getInvoice(uint256 _invoiceId) external view returns (
        address supplier,
        address financier,
        uint256 amount,
        uint256 dueDate,
        uint256 interestRate,
        uint256 createdAt,
        TokenizationStatus status,
        bool approvedBySupplier,
        bool approvedByFinancier,
        string memory invoiceHash
    ) {
        Invoice storage invoice = invoices[_invoiceId];
        return (
            invoice.supplier,
            invoice.financier,
            invoice.amount,
            invoice.dueDate,
            invoice.interestRate,
            invoice.createdAt,
            invoice.status,
            invoice.approvedBySupplier,
            invoice.approvedByFinancier,
            invoice.invoiceHash
        );
    }

    // 计算应还款项
    function calculateRepayment(uint256 _invoiceId) external view returns (uint256 principal, uint256 interest, uint256 total) {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.status == TokenizationStatus.Funded, "Invoice not funded");
        
        principal = invoice.amount;
        
        if (block.timestamp <= invoice.dueDate) {
            uint256 daysElapsed = (block.timestamp - invoice.createdAt) / 1 days;
            interest = (invoice.amount * invoice.interestRate * daysElapsed) / (365 * 10000);
        } else {
            // 逾期利息可以更高，这里简单使用相同利率
            uint256 daysElapsed = (invoice.dueDate - invoice.createdAt) / 1 days;
            interest = (invoice.amount * invoice.interestRate * daysElapsed) / (365 * 10000);
        }
        
        total = principal + interest;
    }

    // 检查是否逾期
    function isOverdue(uint256 _invoiceId) external view returns (bool) {
        Invoice storage invoice = invoices[_invoiceId];
        return block.timestamp > invoice.dueDate;
    }
}