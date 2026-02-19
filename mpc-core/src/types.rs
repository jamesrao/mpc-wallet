//! 核心类型定义

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// 会话ID
pub type SessionId = String;

/// 节点ID
pub type NodeId = String;

/// 参与者ID
pub type ParticipantId = String;

/// 公钥（压缩格式）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PublicKey {
    /// 公钥字节
    pub bytes: Vec<u8>,
    /// 曲线类型
    pub curve_type: CurveType,
}

/// 曲线类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CurveType {
    /// secp256k1 (以太坊、比特币)
    Secp256k1,
    /// ed25519
    Ed25519,
    /// P-256
    P256,
}

/// 签名
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Signature {
    /// 签名字节
    pub bytes: Vec<u8>,
    /// 恢复ID（仅ECDSA）
    pub recovery_id: Option<u8>,
    /// 曲线类型
    pub curve_type: CurveType,
}

/// 密钥分片
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyShare {
    /// 分片索引
    pub index: u32,
    /// 总份数
    pub total: u32,
    /// 门限值
    pub threshold: u32,
    /// 加密后的分片数据
    pub encrypted_share: Vec<u8>,
    /// 分片证明
    pub proof: Option<Vec<u8>>,
    /// 创建时间戳
    pub created_at: u64,
}

/// 签名分片
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureShare {
    /// 分片索引
    pub index: u32,
    /// 签名分片数据
    pub share: Vec<u8>,
    /// 证明
    pub proof: Option<Vec<u8>>,
}

/// 门限方案配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThresholdScheme {
    /// 总参与者数
    pub total_participants: u32,
    /// 门限值（至少需要这么多分片才能签名）
    pub threshold: u32,
    /// 曲线类型
    pub curve_type: CurveType,
    /// 协议类型
    pub protocol: ProtocolType,
}

/// 协议类型
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProtocolType {
    /// GG18协议
    Gg18,
    /// GG20协议
    Gg20,
    /// 自定义协议
    Custom(String),
}

/// 密钥生成请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyGenRequest {
    /// 会话ID
    pub session_id: SessionId,
    /// 门限方案
    pub scheme: ThresholdScheme,
    /// 参与者列表
    pub participants: Vec<ParticipantId>,
    /// 元数据
    pub metadata: HashMap<String, String>,
}

/// 密钥生成响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyGenResponse {
    /// 会话ID
    pub session_id: SessionId,
    /// 公钥
    pub public_key: PublicKey,
    /// 密钥分片（加密的）
    pub key_shares: Vec<KeyShare>,
    /// 状态
    pub status: SessionStatus,
}

/// 签名请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignRequest {
    /// 会话ID
    pub session_id: SessionId,
    /// 消息哈希
    pub message_hash: Vec<u8>,
    /// 参与者列表
    pub participants: Vec<ParticipantId>,
    /// 派生路径（用于HD钱包）
    pub derivation_path: Option<String>,
    /// 元数据
    pub metadata: HashMap<String, String>,
}

/// 签名响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignResponse {
    /// 会话ID
    pub session_id: SessionId,
    /// 完整签名
    pub signature: Option<Signature>,
    /// 签名分片（如果未达到门限）
    pub signature_shares: Vec<SignatureShare>,
    /// 状态
    pub status: SessionStatus,
}

/// 会话状态
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SessionStatus {
    /// 已创建
    Created,
    /// 进行中
    InProgress,
    /// 已完成
    Completed,
    /// 已失败
    Failed,
    /// 已超时
    Timeout,
}

/// 节点健康状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeHealth {
    /// 是否健康
    pub is_healthy: bool,
    /// 最后心跳时间
    pub last_heartbeat: u64,
    /// 负载指标
    pub load_metrics: LoadMetrics,
    /// 错误信息
    pub error_message: Option<String>,
}

/// 负载指标
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadMetrics {
    /// CPU使用率
    pub cpu_usage: f32,
    /// 内存使用率
    pub memory_usage: f32,
    /// 活跃会话数
    pub active_sessions: u32,
    /// 请求队列长度
    pub request_queue_len: u32,
}

/// 安全配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// 是否启用SGX
    pub enable_sgx: bool,
    /// 是否启用HSM
    pub enable_hsm: bool,
    /// 是否启用TEE
    pub enable_tee: bool,
    /// 加密算法
    pub encryption_algorithm: String,
    /// 密钥轮换间隔（秒）
    pub key_rotation_interval: u64,
}

/// 验证签名请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyRequest {
    /// 会话ID
    pub session_id: SessionId,
    /// 消息
    pub message: Vec<u8>,
    /// 签名
    pub signature: Signature,
}

/// 验证签名响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyResponse {
    /// 签名是否有效
    pub valid: bool,
}