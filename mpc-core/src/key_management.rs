//! 密钥管理模块
//!
//! 提供密钥生成、分片管理、轮换和备份功能。

use crate::error::{MpcError, Result};
use crate::protocol::{MpcProtocol, ProtocolFactory};
use crate::security::SecurityManager;
use crate::types::{
    CurveType, KeyGenRequest, KeyGenResponse, KeyShare, ProtocolType, PublicKey, SignRequest,
    SignResponse, Signature, SignatureShare, ThresholdScheme,
};
use std::collections::HashMap;
use std::sync::Arc;

/// 密钥管理器
pub struct KeyManager {
    /// MPC协议实例
    protocol: Box<dyn MpcProtocol>,
    /// 安全管理器
    security_manager: Arc<SecurityManager>,
    /// 密钥存储（内存缓存，实际应持久化）
    key_store: HashMap<String, Vec<KeyShare>>,
    /// 公钥存储
    public_key_store: HashMap<String, PublicKey>,
}

impl KeyManager {
    /// 创建新的密钥管理器
    pub fn new(
        protocol_type: ProtocolType,
        security_manager: Arc<SecurityManager>,
    ) -> Result<Self> {
        let protocol = ProtocolFactory::create_protocol(protocol_type)?;

        Ok(Self {
            protocol,
            security_manager,
            key_store: HashMap::new(),
            public_key_store: HashMap::new(),
        })
    }

    /// 生成新的MPC密钥
    pub fn generate_key(&mut self, request: KeyGenRequest) -> Result<KeyGenResponse> {
        // 使用MPC协议生成密钥
        let response = self.protocol.generate_key(&request)?;

        // 安全存储密钥分片
        for key_share in &response.key_shares {
            // 在实际实现中，应该将加密后的分片存储到安全存储中
            // 这里简化处理，存储在内存中
            let wallet_id = format!("{}-{}", request.session_id, key_share.index);
            self.key_store.insert(wallet_id, vec![key_share.clone()]);
        }

        // 存储公钥
        self.public_key_store
            .insert(request.session_id.clone(), response.public_key.clone());

        Ok(response)
    }

    /// 获取公钥
    pub fn get_public_key(&self, session_id: &str) -> Result<PublicKey> {
        self.public_key_store
            .get(session_id)
            .cloned()
            .ok_or_else(|| MpcError::InvalidParameter(format!("Session not found: {}", session_id)))
    }

    /// 获取密钥分片（安全恢复）
    pub fn get_key_share(&self, session_id: &str, share_index: u32) -> Result<KeyShare> {
        let wallet_id = format!("{}-{}", session_id, share_index);
        let shares = self
            .key_store
            .get(&wallet_id)
            .ok_or_else(|| MpcError::InvalidParameter(format!("Key share not found: {}", wallet_id)))?;

        // 返回第一个分片（简化处理）
        shares
            .first()
            .cloned()
            .ok_or_else(|| MpcError::InvalidState("No key shares available".to_string()))
    }

    /// 签名
    pub fn sign(&self, request: SignRequest) -> Result<SignResponse> {
        // 验证会话存在
        if !self.public_key_store.contains_key(&request.session_id) {
            return Err(MpcError::InvalidParameter(format!(
                "Session not found: {}",
                request.session_id
            )));
        }

        // 使用MPC协议签名
        self.protocol.sign(&request)
    }

    /// 验证签名
    pub fn verify_signature(
        &self,
        session_id: &str,
        message: &[u8],
        signature: &Signature,
    ) -> Result<bool> {
        let public_key = self.get_public_key(session_id)?;
        self.protocol.verify_signature(&public_key, message, signature)
    }

    /// 合并签名分片
    pub fn combine_signature_shares(
        &self,
        session_id: &str,
        message: &[u8],
        shares: &[SignatureShare],
    ) -> Result<Signature> {
        let public_key = self.get_public_key(session_id)?;
        self.protocol
            .combine_signature_shares(&public_key, message, shares)
    }

    /// 轮换密钥分片
    pub fn rotate_key_shares(&mut self, session_id: &str) -> Result<()> {
        // 在实际实现中，应该：
        // 1. 生成新的密钥分片
        // 2. 安全迁移资产
        // 3. 销毁旧的分片
        // 这里简化处理

        // 检查会话是否存在
        if !self.public_key_store.contains_key(session_id) {
            return Err(MpcError::InvalidParameter(format!(
                "Session not found: {}",
                session_id
            )));
        }

        // 示例：标记分片已轮换
        // 实际实现需要更复杂的逻辑

        Ok(())
    }

    /// 备份密钥分片
    pub fn backup_key_shares(&self, session_id: &str) -> Result<Vec<Vec<u8>>> {
        let mut backups = Vec::new();

        // 查找该会话的所有分片
        for (wallet_id, shares) in &self.key_store {
            if wallet_id.starts_with(session_id) {
                for share in shares {
                    // 序列化分片
                    let serialized = serde_json::to_vec(share)?;
                    backups.push(serialized);
                }
            }
        }

        if backups.is_empty() {
            return Err(MpcError::InvalidParameter(format!(
                "No key shares found for session: {}",
                session_id
            )));
        }

        Ok(backups)
    }

    /// 恢复密钥分片
    pub fn restore_key_shares(&mut self, session_id: &str, backups: &[Vec<u8>]) -> Result<()> {
        // 清空现有分片
        self.key_store.retain(|k, _| !k.starts_with(session_id));

        // 恢复分片
        for (i, backup) in backups.iter().enumerate() {
            let share: KeyShare = serde_json::from_slice(backup)?;
            let wallet_id = format!("{}-{}", session_id, i);
            self.key_store.insert(wallet_id, vec![share]);
        }

        Ok(())
    }

    /// 创建默认的门限方案
    pub fn create_default_scheme(curve_type: CurveType) -> ThresholdScheme {
        ThresholdScheme {
            total_participants: 3,
            threshold: 2,
            curve_type,
            protocol: ProtocolType::Gg18,
        }
    }

    /// 创建自定义门限方案
    pub fn create_custom_scheme(
        total_participants: u32,
        threshold: u32,
        curve_type: CurveType,
        protocol: ProtocolType,
    ) -> Result<ThresholdScheme> {
        if threshold == 0 || threshold > total_participants {
            return Err(MpcError::InvalidParameter(format!(
                "Invalid threshold: {}, total participants: {}",
                threshold, total_participants
            )));
        }

        Ok(ThresholdScheme {
            total_participants,
            threshold,
            curve_type,
            protocol,
        })
    }
}

/// 密钥生成器
pub struct KeyGenerator {
    /// 密钥管理器
    key_manager: Arc<tokio::sync::Mutex<KeyManager>>,
}

impl KeyGenerator {
    /// 创建新的密钥生成器
    pub fn new(key_manager: Arc<tokio::sync::Mutex<KeyManager>>) -> Self {
        Self { key_manager }
    }

    /// 异步生成密钥
    pub async fn generate_key_async(&self, request: KeyGenRequest) -> Result<KeyGenResponse> {
        let mut manager = self.key_manager.lock().await;
        manager.generate_key(request)
    }

    /// 异步签名
    pub async fn sign_async(&self, request: SignRequest) -> Result<SignResponse> {
        let manager = self.key_manager.lock().await;
        manager.sign(request)
    }
}

#[cfg(test)]
mod tests {
    use super::*;


    #[test]
    fn test_create_default_scheme() {
        let scheme = KeyManager::create_default_scheme(CurveType::Secp256k1);
        assert_eq!(scheme.total_participants, 3);
        assert_eq!(scheme.threshold, 2);
        assert_eq!(scheme.curve_type, CurveType::Secp256k1);
        assert_eq!(scheme.protocol, ProtocolType::Gg18);
    }

    #[test]
    fn test_create_custom_scheme() {
        let scheme = KeyManager::create_custom_scheme(5, 3, CurveType::Ed25519, ProtocolType::Gg20)
            .expect("Should create custom scheme");
        assert_eq!(scheme.total_participants, 5);
        assert_eq!(scheme.threshold, 3);
        assert_eq!(scheme.curve_type, CurveType::Ed25519);
        assert_eq!(scheme.protocol, ProtocolType::Gg20);
    }

    #[test]
    fn test_invalid_custom_scheme() {
        let result = KeyManager::create_custom_scheme(3, 5, CurveType::Secp256k1, ProtocolType::Gg18);
        assert!(result.is_err());
    }
}