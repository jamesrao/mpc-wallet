//! MPC核心服务库
//!
//! 提供基于门限签名（MPC）的密钥管理、签名和验证功能。

pub mod crypto;
pub mod error;
pub mod key_management;
pub mod protocol;
pub mod security;
pub mod server;
pub mod types;

pub use crypto::{ShamirSecretSharing, EllipticCurveCrypto, ThresholdSignature};
pub use error::{MpcError, Result};
pub use types::{KeyShare, SignatureShare, PublicKey, Signature, SessionId};