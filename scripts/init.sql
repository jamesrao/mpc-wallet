-- MPC钱包系统数据库初始化脚本
-- 创建必要的扩展和表结构

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facebook_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建钱包表
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID,
    name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    chain_type VARCHAR(50) NOT NULL,
    wallet_type VARCHAR(50) DEFAULT 'mpc',
    threshold INTEGER DEFAULT 2,
    total_shares INTEGER DEFAULT 3,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建MPC会话表
CREATE TABLE IF NOT EXISTS mpc_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    participants JSONB,
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

-- 创建交易表
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) UNIQUE,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount VARCHAR(255) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    gas_used VARCHAR(255),
    gas_price VARCHAR(255),
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_mpc_sessions_wallet_id ON mpc_sessions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_chain ON transactions(chain);

-- 创建审计表（可选）
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建审计日志索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- 插入初始数据（可选）
-- INSERT INTO users (email, name, status) VALUES ('admin@mpcwallet.com', '系统管理员', 'active');

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mpc_sessions_updated_at BEFORE UPDATE ON mpc_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建只读用户用于监控（可选）
-- CREATE USER mpc_monitor WITH PASSWORD 'monitor_password';
-- GRANT CONNECT ON DATABASE mpc_wallet TO mpc_monitor;
-- GRANT USAGE ON SCHEMA public TO mpc_monitor;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO mpc_monitor;

-- 创建统计视图（可选）
CREATE OR REPLACE VIEW wallet_stats AS
SELECT 
    chain_type,
    COUNT(*) as total_wallets,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_wallets,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_wallets
FROM wallets 
GROUP BY chain_type;

-- 创建用户钱包统计视图
CREATE OR REPLACE VIEW user_wallet_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(w.id) as total_wallets,
    COUNT(CASE WHEN w.status = 'active' THEN 1 END) as active_wallets
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
GROUP BY u.id, u.email, u.name;

-- 输出初始化完成信息
\echo 'MPC钱包系统数据库初始化完成！'