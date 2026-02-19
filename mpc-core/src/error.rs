//! 错误处理模块

use thiserror::Error;

/// MPC错误类型
#[derive(Error, Debug)]
pub enum MpcError {
    /// 参数错误
    #[error("Invalid parameter: {0}")]
    InvalidParameter(String),
    
    /// 状态错误
    #[error("Invalid state: {0}")]
    InvalidState(String),
    
    /// 密码学错误
    #[error("Cryptographic error: {0}")]
    Crypto(String),
    
    /// 协议错误
    #[error("Protocol error: {0}")]
    Protocol(String),
    
    /// 序列化错误
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    /// 其他错误
    #[error("Other error: {0}")]
    Other(String),
}

/// Result类型别名
pub type Result<T> = std::result::Result<T, MpcError>;