//! MPC协议实现
//!
//! 提供GG18/GG20协议的基本实现。

use crate::error::{MpcError, Result};
use crate::types::{
    CurveType, KeyGenRequest, KeyGenResponse, KeyShare, ProtocolType, PublicKey, SignRequest,
    SignResponse, Signature, SignatureShare,
};
use rand::RngCore;

/// MPC协议trait
pub trait MpcProtocol: Send + Sync {
    /// 协议类型
    fn protocol_type(&self) -> ProtocolType;

    /// 支持的曲线类型
    fn supported_curves(&self) -> Vec<CurveType>;

    /// 生成密钥
    fn generate_key(&self, request: &KeyGenRequest) -> Result<KeyGenResponse>;

    /// 签名
    fn sign(&self, request: &SignRequest) -> Result<SignResponse>;

    /// 验证签名
    fn verify_signature(&self, public_key: &PublicKey, message: &[u8], signature: &Signature) -> Result<bool>;

    /// 合并签名分片
    fn combine_signature_shares(
        &self,
        public_key: &PublicKey,
        message: &[u8],
        shares: &[SignatureShare],
    ) -> Result<Signature>;
}

/// GG18协议实现
pub struct Gg18Protocol {
    /// 配置参数
    config: Gg18Config,
}

/// GG18配置
#[derive(Debug, Clone)]
pub struct Gg18Config {
    /// 安全参数
    security_param: u32,
    /// 是否启用零知识证明
    enable_zkp: bool,
    /// 最大参与者数
    max_participants: u32,
}

impl Default for Gg18Config {
    fn default() -> Self {
        Self {
            security_param: 128,
            enable_zkp: true,
            max_participants: 10,
        }
    }
}

impl Gg18Protocol {
    /// 创建新的GG18协议实例
    pub fn new(config: Gg18Config) -> Self {
        Self { config }
    }

    /// 生成随机字节
    fn secure_random(&self, length: usize) -> Vec<u8> {
        let mut rng = rand::thread_rng();
        let mut bytes = vec![0u8; length];
        rng.try_fill_bytes(&mut bytes).expect("RNG failed");
        bytes
    }
}

impl MpcProtocol for Gg18Protocol {
    fn protocol_type(&self) -> ProtocolType {
        ProtocolType::Gg18
    }

    fn supported_curves(&self) -> Vec<CurveType> {
        vec![CurveType::Secp256k1]
    }

    fn generate_key(&self, request: &KeyGenRequest) -> Result<KeyGenResponse> {
        // 1. 参数验证
        if request.scheme.total_participants > self.config.max_participants {
            return Err(MpcError::InvalidParameter(format!(
                "Too many participants: {}, max is {}",
                request.scheme.total_participants, self.config.max_participants
            )));
        }

        if request.scheme.threshold == 0 || request.scheme.threshold > request.scheme.total_participants {
            return Err(MpcError::InvalidParameter(format!(
                "Invalid threshold: {}, total participants: {}",
                request.scheme.threshold, request.scheme.total_participants
            )));
        }

        // 2. 生成模拟公钥 (33字节压缩公钥)
        let public_key = PublicKey {
            bytes: self.secure_random(33),
            curve_type: CurveType::Secp256k1,
        };

        // 3. 生成模拟密钥分片
        let mut key_shares = Vec::new();
        for i in 0..request.scheme.total_participants {
            key_shares.push(KeyShare {
                index: i,
                total: request.scheme.total_participants,
                threshold: request.scheme.threshold,
                encrypted_share: self.secure_random(64),
                proof: if self.config.enable_zkp {
                    Some(self.secure_random(128))
                } else {
                    None
                },
                created_at: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| MpcError::Crypto(e.to_string()))?
                    .as_secs(),
            });
        }

        Ok(KeyGenResponse {
            session_id: request.session_id.clone(),
            public_key,
            key_shares,
            status: crate::types::SessionStatus::Completed,
        })
    }

    fn sign(&self, request: &SignRequest) -> Result<SignResponse> {
        // 1. 验证参数
        if request.participants.is_empty() {
            return Err(MpcError::InvalidParameter("No participants specified".into()));
        }

        // 2. 生成模拟签名 (64字节ECDSA签名)
        let signature = Signature {
            bytes: self.secure_random(64),
            recovery_id: Some(0),
            curve_type: CurveType::Secp256k1,
        };

        // 3. 生成模拟签名分片
        let mut signature_shares = Vec::new();
        if request.participants.len() < self.config.max_participants as usize {
            for (i, _participant) in request.participants.iter().enumerate() {
                let share = SignatureShare {
                    index: i as u32,
                    share: self.secure_random(32),
                    proof: if self.config.enable_zkp {
                        Some(self.secure_random(128))
                    } else {
                        None
                    },
                };
                signature_shares.push(share);
            }
        }

        Ok(SignResponse {
            session_id: request.session_id.clone(),
            signature: Some(signature),
            signature_shares,
            status: crate::types::SessionStatus::Completed,
        })
    }

    fn verify_signature(&self, _public_key: &PublicKey, _message: &[u8], _signature: &Signature) -> Result<bool> {
        // 模拟验证，总是返回true
        Ok(true)
    }

    fn combine_signature_shares(
        &self,
        _public_key: &PublicKey,
        _message: &[u8],
        _shares: &[SignatureShare],
    ) -> Result<Signature> {
        // 模拟合并签名分片
        Ok(Signature {
            bytes: self.secure_random(64),
            recovery_id: Some(0),
            curve_type: CurveType::Secp256k1,
        })
    }
}

/// GG20协议实现
pub struct Gg20Protocol {
    /// 配置参数
    config: Gg20Config,
}

/// GG20配置
#[derive(Debug, Clone)]
pub struct Gg20Config {
    /// 安全参数
    security_param: u32,
    /// 是否支持EdDSA
    support_eddsa: bool,
    /// 批量签名支持
    batch_signing: bool,
}

impl Default for Gg20Config {
    fn default() -> Self {
        Self {
            security_param: 128,
            support_eddsa: true,
            batch_signing: true,
        }
    }
}

impl Gg20Protocol {
    /// 创建新的GG20协议实例
    pub fn new(config: Gg20Config) -> Self {
        Self { config }
    }

    /// 生成随机字节
    fn secure_random(&self, length: usize) -> Vec<u8> {
        let mut rng = rand::thread_rng();
        let mut bytes = vec![0u8; length];
        rng.try_fill_bytes(&mut bytes).expect("RNG failed");
        bytes
    }
}

impl MpcProtocol for Gg20Protocol {
    fn protocol_type(&self) -> ProtocolType {
        ProtocolType::Gg20
    }

    fn supported_curves(&self) -> Vec<CurveType> {
        let mut curves = vec![CurveType::Secp256k1];
        if self.config.support_eddsa {
            curves.push(CurveType::Ed25519);
        }
        curves
    }

    fn generate_key(&self, request: &KeyGenRequest) -> Result<KeyGenResponse> {
        // 模拟GG20密钥生成
        let public_key = PublicKey {
            bytes: self.secure_random(33),
            curve_type: request.scheme.curve_type,
        };

        let mut key_shares = Vec::new();
        for i in 0..request.scheme.total_participants {
            key_shares.push(KeyShare {
                index: i,
                total: request.scheme.total_participants,
                threshold: request.scheme.threshold,
                encrypted_share: self.secure_random(64),
                proof: Some(self.secure_random(128)),
                created_at: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| MpcError::Crypto(e.to_string()))?
                    .as_secs(),
            });
        }

        Ok(KeyGenResponse {
            session_id: request.session_id.clone(),
            public_key,
            key_shares,
            status: crate::types::SessionStatus::Completed,
        })
    }

    fn sign(&self, request: &SignRequest) -> Result<SignResponse> {
        // 模拟GG20签名
        let signature = Signature {
            bytes: self.secure_random(64),
            recovery_id: Some(0), // secp256k1 always has recovery id
            curve_type: CurveType::Secp256k1,
        };

        Ok(SignResponse {
            session_id: request.session_id.clone(),
            signature: Some(signature),
            signature_shares: Vec::new(),
            status: crate::types::SessionStatus::Completed,
        })
    }

    fn verify_signature(&self, _public_key: &PublicKey, _message: &[u8], _signature: &Signature) -> Result<bool> {
        Ok(true)
    }

    fn combine_signature_shares(
        &self,
        _public_key: &PublicKey,
        _message: &[u8],
        _shares: &[SignatureShare],
    ) -> Result<Signature> {
        Ok(Signature {
            bytes: self.secure_random(64),
            recovery_id: Some(0),
            curve_type: CurveType::Secp256k1,
        })
    }
}

/// 协议工厂
pub struct ProtocolFactory;

impl ProtocolFactory {
    /// 根据协议类型创建协议实例
    pub fn create_protocol(protocol_type: ProtocolType) -> Result<Box<dyn MpcProtocol>> {
        match protocol_type {
            ProtocolType::Gg18 => Ok(Box::new(Gg18Protocol::new(Gg18Config::default()))),
            ProtocolType::Gg20 => Ok(Box::new(Gg20Protocol::new(Gg20Config::default()))),
            ProtocolType::Custom(name) => Err(MpcError::Protocol(format!(
                "Custom protocol not supported: {}",
                name
            ))),
        }
    }
}