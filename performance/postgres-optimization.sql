-- PostgreSQL性能调优配置
-- 在数据库启动后执行这些优化命令

-- 1. 调整共享缓冲区大小
ALTER SYSTEM SET shared_buffers = '256MB';

-- 2. 调整工作内存
ALTER SYSTEM SET work_mem = '16MB';

-- 3. 调整维护工作内存
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- 4. 启用并行查询
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- 5. 调整检查点配置
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';

-- 6. 日志配置
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 记录执行时间超过1秒的查询

-- 7. 重启数据库使配置生效
SELECT pg_reload_conf();

-- 8. 创建关键索引
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 9. 更新统计信息
ANALYZE;

-- 10. 显示当前配置
SELECT name, setting, unit FROM pg_settings 
WHERE name IN ('shared_buffers', 'work_mem', 'maintenance_work_mem', 'max_connections');
