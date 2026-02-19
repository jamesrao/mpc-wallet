-- MPC钱包数据库初始化脚本

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    mpc_public_key TEXT,
    meta_user_id VARCHAR(255), -- Meta生态用户ID
    kyc_status VARCHAR(50) DEFAULT 'pending',
    risk_level VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 组织/企业表
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(100) UNIQUE,
    legal_representative VARCHAR(100),
    business_license_url TEXT,
    kyc_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户-组织关联表
CREATE TABLE user_organizations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- owner, admin, member
    PRIMARY KEY (user_id, organization_id)
);

-- 钱包表
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255), -- 钱包显示名称
    wallet_address VARCHAR(255) NOT NULL,
    chain_type VARCHAR(50) NOT NULL, -- ethereum, polygon, bsc, substrate
    wallet_type VARCHAR(50) NOT NULL, -- mpc, eoa, multisig
    threshold INTEGER, -- MPC门限值
    total_shares INTEGER, -- MPC总份数
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_address, chain_type)
);

-- MPC密钥分片表（加密存储）
CREATE TABLE mpc_key_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    share_index INTEGER NOT NULL,
    encrypted_share TEXT NOT NULL, -- 加密后的密钥分片
    storage_location VARCHAR(100), -- hsm, tee, cloud
    node_id VARCHAR(100), -- MPC节点ID
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rotated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(wallet_id, share_index)
);

-- 资产表
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    chain_type VARCHAR(50) NOT NULL,
    contract_address VARCHAR(255), -- 代币合约地址，NULL表示原生代币
    symbol VARCHAR(50) NOT NULL,
    decimals INTEGER DEFAULT 18,
    balance DECIMAL(36, 18) DEFAULT 0,
    balance_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_id, chain_type, contract_address)
);

-- 交易表
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(255) UNIQUE,
    chain_type VARCHAR(50) NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    value DECIMAL(36, 18),
    contract_address VARCHAR(255),
    method_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
    block_number BIGINT,
    gas_used DECIMAL(18, 0),
    transaction_fee DECIMAL(36, 18),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    raw_transaction JSONB
);

-- 支付订单表（跨境电商）
CREATE TABLE payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    buyer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    amount DECIMAL(36, 18) NOT NULL,
    currency VARCHAR(10) NOT NULL, -- USDT, USDC, ETH
    escrow_contract_address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'created', -- created, paid, shipped, confirmed, disputed, refunded
    product_description TEXT,
    shipping_address JSONB,
    buyer_confirmed_at TIMESTAMP WITH TIME ZONE,
    seller_shipped_at TIMESTAMP WITH TIME ZONE,
    dispute_reason TEXT,
    refund_amount DECIMAL(36, 18),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 供应链金融应收账款表
CREATE TABLE supply_chain_receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    buyer_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    amount DECIMAL(36, 18) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    due_date DATE NOT NULL,
    token_id VARCHAR(255), -- NFT Token ID
    token_contract_address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, tokenized, financed, repaid, default
    financing_amount DECIMAL(36, 18),
    financing_rate DECIMAL(10, 4),
    financier_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 审批流程表
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(50) NOT NULL, -- transaction, withdrawal, payment
    target_id UUID NOT NULL,
    approver_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    approval_level INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志表
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_status INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_meta_user_id ON users(meta_user_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_organization_id ON wallets(organization_id);
CREATE INDEX idx_wallets_address_chain ON wallets(wallet_address, chain_type);
CREATE INDEX idx_mpc_key_shares_wallet_id ON mpc_key_shares(wallet_id);
CREATE INDEX idx_assets_wallet_id ON assets(wallet_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX idx_payment_orders_buyer ON payment_orders(buyer_user_id);
CREATE INDEX idx_payment_orders_seller ON payment_orders(seller_organization_id);
CREATE INDEX idx_receivables_supplier ON supply_chain_receivables(supplier_organization_id);
CREATE INDEX idx_receivables_buyer ON supply_chain_receivables(buyer_organization_id);
CREATE INDEX idx_approvals_target ON approvals(target_type, target_id);
CREATE INDEX idx_audit_logs_user_org ON audit_logs(user_id, organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receivables_updated_at BEFORE UPDATE ON supply_chain_receivables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建初始管理员用户（密码需要在实际部署时修改）
INSERT INTO users (email, username, password_hash, kyc_status, risk_level)
VALUES ('admin@mpcwallet.com', 'admin', '$2b$10$YourHashedPasswordHere', 'verified', 'low')
ON CONFLICT (email) DO NOTHING;