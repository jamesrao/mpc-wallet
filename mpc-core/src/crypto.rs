//! 密码学实现模块
//!
//! 提供Shamir秘密共享、门限签名、椭圆曲线运算等核心密码学功能。

use crate::error::{MpcError, Result};
use crate::types::{CurveType, PublicKey, Signature};
use k256::elliptic_curve::sec1::ToEncodedPoint;
use k256::SecretKey;
use num_bigint::{BigInt, Sign};
use num_traits::{One, Signed, Zero};
use rand::Rng;
use std::convert::TryInto;

/// 有限域上的多项式
#[derive(Debug, Clone)]
pub struct Polynomial {
    /// 多项式系数，从低到高排列
    coefficients: Vec<BigInt>,
    /// 模数（素数）
    modulus: BigInt,
}

impl Polynomial {
    /// 创建随机多项式
    /// degree: 多项式次数
    /// constant: 常数项（秘密）
    /// modulus: 有限域模数
    pub fn random(degree: usize, constant: BigInt, modulus: BigInt) -> Self {
        let mut rng = rand::thread_rng();
        let mut coefficients = vec![constant];
        
        // 生成随机系数
        for _ in 0..degree {
            // 生成随机字节并转换为BigInt
            let mut random_bytes = [0u8; 32];
            rng.fill(&mut random_bytes);
            let coef = BigInt::from_bytes_be(Sign::Plus, &random_bytes) % &modulus;
            coefficients.push(coef);
        }
        
        Self {
            coefficients,
            modulus,
        }
    }
    
    /// 在点x处求值
    pub fn evaluate(&self, x: &BigInt) -> BigInt {
        let mut result = BigInt::zero();
        let mut x_power = BigInt::one();
        
        for coef in &self.coefficients {
            result = (result + coef * &x_power) % &self.modulus;
            x_power = (x_power * x) % &self.modulus;
        }
        
        result
    }
    
    /// 拉格朗日插值恢复秘密
    /// points: 已知的点对 (x, y)
    /// x: 要插值的x坐标（通常为0，用于恢复常数项）
    pub fn lagrange_interpolation(points: &[(BigInt, BigInt)], x: &BigInt, modulus: &BigInt) -> BigInt {
        let mut result = BigInt::zero();
        
        for (i, (xi, yi)) in points.iter().enumerate() {
            let mut numerator = BigInt::one();
            let mut denominator = BigInt::one();
            
            for (j, (xj, _)) in points.iter().enumerate() {
                if i != j {
                    numerator = (numerator * (x - xj)) % modulus;
                    denominator = (denominator * (xi - xj)) % modulus;
                }
            }
            
            // 计算分母的模逆
            let denominator_inv = mod_inverse(&denominator, modulus)
                .expect("Denominator should be invertible");
            
            let term = (numerator * denominator_inv * yi) % modulus;
            result = (result + term) % modulus;
        }
        
        result
    }
}

/// 计算模逆
fn mod_inverse(a: &BigInt, modulus: &BigInt) -> Option<BigInt> {
    // 使用扩展欧几里得算法
    let (mut old_r, mut r) = (a.clone(), modulus.clone());
    let (mut old_s, mut s) = (BigInt::one(), BigInt::zero());
    
    while !r.is_zero() {
        let quotient = &old_r / &r;
        let (new_r, new_s) = (
            &old_r - &quotient * &r,
            &old_s - &quotient * &s,
        );
        
        old_r = r;
        r = new_r;
        old_s = s;
        s = new_s;
    }
    
    if old_r.abs() != BigInt::one() {
        // 不存在逆元
        return None;
    }
    
    Some((old_s % modulus + modulus) % modulus)
}

/// Shamir秘密共享
#[derive(Debug, Clone)]
pub struct ShamirSecretSharing {
    /// 门限值
    threshold: usize,
    /// 总份数
    total_shares: usize,
    /// 有限域模数（secp256k1的阶）
    modulus: BigInt,
}

impl ShamirSecretSharing {
    /// 创建新的秘密共享实例
    pub fn new(threshold: usize, total_shares: usize) -> Self {
        // secp256k1的阶
        let modulus = BigInt::parse_bytes(b"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16)
            .expect("Invalid modulus");
        
        Self {
            threshold,
            total_shares,
            modulus,
        }
    }
    
    /// 分割秘密
    pub fn split_secret(&self, secret: &[u8]) -> Result<Vec<(BigInt, BigInt)>> {
        if secret.len() != 32 {
            return Err(MpcError::InvalidParameter("Secret must be 32 bytes".to_string()));
        }
        
        let secret_int = BigInt::from_bytes_be(num_bigint::Sign::Plus, secret);
        
        // 生成随机多项式
        let poly = Polynomial::random(self.threshold - 1, secret_int, self.modulus.clone());
        
        // 生成分片
        let mut shares = Vec::new();
        for i in 1..=self.total_shares {
            let x = BigInt::from(i);
            let y = poly.evaluate(&x);
            shares.push((x, y));
        }
        
        Ok(shares)
    }
    
    /// 恢复秘密
    pub fn recover_secret(&self, shares: &[(BigInt, BigInt)]) -> Result<Vec<u8>> {
        if shares.len() < self.threshold {
            return Err(MpcError::InvalidParameter(
                format!("Need at least {} shares, got {}", self.threshold, shares.len())
            ));
        }
        
        let secret = Polynomial::lagrange_interpolation(shares, &BigInt::zero(), &self.modulus);
        
        // 转换为字节
        let bytes = secret.to_signed_bytes_be();
        if bytes.len() > 32 {
            return Err(MpcError::Crypto("Recovered secret too long".to_string()));
        }
        
        // 填充到32字节
        let mut result = vec![0u8; 32];
        let start_index = 32 - bytes.len();
        result[start_index..].copy_from_slice(&bytes);
        
        Ok(result)
    }
}

/// 椭圆曲线密码学操作
#[derive(Debug, Clone)]
pub struct EllipticCurveCrypto {
    /// 曲线类型
    curve_type: CurveType,
}

impl EllipticCurveCrypto {
    /// 创建新的椭圆曲线实例
    pub fn new(curve_type: CurveType) -> Self {
        Self { curve_type }
    }
    
    /// 生成密钥对
    pub fn generate_keypair(&self) -> Result<(Vec<u8>, PublicKey)> {
        match self.curve_type {
            CurveType::Secp256k1 => {
                let mut rng = rand::thread_rng();
                let secret_key = SecretKey::random(&mut rng);
                let public_key = secret_key.public_key();
                
                let private_key_bytes = secret_key.to_bytes().to_vec();
                let public_key_bytes = public_key.to_encoded_point(true).as_bytes().to_vec();
                
                Ok((private_key_bytes, PublicKey {
                    bytes: public_key_bytes,
                    curve_type: CurveType::Secp256k1,
                }))
            }
            _ => Err(MpcError::Crypto(format!("Unsupported curve: {:?}", self.curve_type))),
        }
    }
    
    /// 签名消息
    pub fn sign_message(&self, private_key: &[u8], message: &[u8]) -> Result<Signature> {
        match self.curve_type {
            CurveType::Secp256k1 => {
                use k256::ecdsa::{signature::Signer, Signature as K256Signature, SigningKey};
                
                // 将字节数组转换为固定长度的数组
                let private_key_array: [u8; 32] = private_key.try_into()
                    .map_err(|_| MpcError::Crypto("Invalid private key length".to_string()))?;
                
                let signing_key = SigningKey::from_bytes(&private_key_array.into())
                    .map_err(|e| MpcError::Crypto(e.to_string()))?;
                
                let signature: K256Signature = signing_key.sign(message);
                let signature_bytes = signature.to_bytes().to_vec();
                
                Ok(Signature {
                    bytes: signature_bytes,
                    recovery_id: Some(0), // 简化处理
                    curve_type: CurveType::Secp256k1,
                })
            }
            _ => Err(MpcError::Crypto(format!("Unsupported curve: {:?}", self.curve_type))),
        }
    }
    
    /// 验证签名
    pub fn verify_signature(
        &self,
        public_key: &PublicKey,
        message: &[u8],
        signature: &Signature,
    ) -> Result<bool> {
        match self.curve_type {
            CurveType::Secp256k1 => {
                use k256::ecdsa::{signature::Verifier, Signature as K256Signature, VerifyingKey};
                
                let verifying_key = VerifyingKey::from_sec1_bytes(&public_key.bytes)
                    .map_err(|e| MpcError::Crypto(e.to_string()))?;
                
                // 将签名字节转换为固定长度的数组
                let sig_bytes: [u8; 64] = signature.bytes.as_slice().try_into()
                    .map_err(|_| MpcError::Crypto("Invalid signature length".to_string()))?;
                
                let sig = K256Signature::from_bytes(&sig_bytes.into())
                    .map_err(|e| MpcError::Crypto(e.to_string()))?;
                
                verifying_key.verify(message, &sig)
                    .map(|_| true)
                    .map_err(|e| MpcError::Crypto(e.to_string()))
            }
            _ => Err(MpcError::Crypto(format!("Unsupported curve: {:?}", self.curve_type))),
        }
    }
    
    /// 从私钥派生公钥
    pub fn derive_public_key(&self, private_key: &[u8]) -> Result<PublicKey> {
        match self.curve_type {
            CurveType::Secp256k1 => {
                // 将字节数组转换为固定长度的数组
                let private_key_array: [u8; 32] = private_key.try_into()
                    .map_err(|_| MpcError::Crypto("Invalid private key length".to_string()))?;
                
                let secret_key = SecretKey::from_bytes(&private_key_array.into())
                    .map_err(|e| MpcError::Crypto(e.to_string()))?;
                
                let public_key = secret_key.public_key();
                let public_key_bytes = public_key.to_encoded_point(true).as_bytes().to_vec();
                
                Ok(PublicKey {
                    bytes: public_key_bytes,
                    curve_type: CurveType::Secp256k1,
                })
            }
            _ => Err(MpcError::Crypto(format!("Unsupported curve: {:?}", self.curve_type))),
        }
    }
}

/// 门限签名方案
#[derive(Debug, Clone)]
pub struct ThresholdSignature {
    /// 秘密共享方案
    shamir: ShamirSecretSharing,
    /// 椭圆曲线密码学
    ecc: EllipticCurveCrypto,
}

impl ThresholdSignature {
    /// 创建新的门限签名实例
    pub fn new(threshold: usize, total_shares: usize, curve_type: CurveType) -> Self {
        Self {
            shamir: ShamirSecretSharing::new(threshold, total_shares),
            ecc: EllipticCurveCrypto::new(curve_type),
        }
    }
    
    /// 生成门限密钥对
    pub fn generate_threshold_keypair(&self) -> Result<(Vec<Vec<u8>>, PublicKey)> {
        // 生成主私钥
        let (master_private_key, public_key) = self.ecc.generate_keypair()?;
        
        // 分割私钥
        let shares = self.shamir.split_secret(&master_private_key)?;
        
        // 转换为字节格式
        let share_bytes: Vec<Vec<u8>> = shares
            .iter()
            .map(|(x, y)| {
                let mut share = x.to_signed_bytes_be();
                share.extend_from_slice(&y.to_signed_bytes_be());
                share
            })
            .collect();
        
        Ok((share_bytes, public_key))
    }
    
    /// 使用门限签名（需要至少threshold个分片）
    pub fn threshold_sign(
        &self,
        shares: &[Vec<u8>],
        message: &[u8],
    ) -> Result<Signature> {
        if shares.len() < self.shamir.threshold {
            return Err(MpcError::InvalidParameter(
                format!("Need at least {} shares, got {}", self.shamir.threshold, shares.len())
            ));
        }
        
        // 恢复主私钥
        let recovered_shares: Vec<(BigInt, BigInt)> = shares
            .iter()
            .map(|share| {
                if share.len() < 8 {
                    return Err(MpcError::InvalidParameter("Invalid share format".to_string()));
                }
                
                let x_len = (share[0] as usize) & 0x7F;
                if share.len() < 1 + x_len {
                    return Err(MpcError::InvalidParameter("Invalid share format".to_string()));
                }
                
                let x = BigInt::from_signed_bytes_be(&share[1..1 + x_len]);
                let y = BigInt::from_signed_bytes_be(&share[1 + x_len..]);
                
                Ok((x, y))
            })
            .collect::<Result<Vec<_>>>()?;
        
        let master_private_key = self.shamir.recover_secret(&recovered_shares)?;
        
        // 使用恢复的私钥签名
        self.ecc.sign_message(&master_private_key, message)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_shamir_secret_sharing() {
        let shamir = ShamirSecretSharing::new(2, 3);
        let secret = b"this is a 32-byte secret key!!!";
        
        // 分割秘密
        let shares = shamir.split_secret(secret).unwrap();
        assert_eq!(shares.len(), 3);
        
        // 恢复秘密（使用前2个分片）
        let recovered = shamir.recover_secret(&shares[0..2]).unwrap();
        assert_eq!(recovered, secret);
        
        // 恢复秘密（使用后2个分片）
        let recovered2 = shamir.recover_secret(&shares[1..3]).unwrap();
        assert_eq!(recovered2, secret);
    }
    
    #[test]
    fn test_threshold_signature() {
        let threshold_sig = ThresholdSignature::new(2, 3, CurveType::Secp256k1);
        
        // 生成门限密钥对
        let (shares, public_key) = threshold_sig.generate_threshold_keypair().unwrap();
        assert_eq!(shares.len(), 3);
        
        // 使用前2个分片签名
        let message = b"test message";
        let signature = threshold_sig.threshold_sign(&shares[0..2], message).unwrap();
        
        // 验证签名
        let valid = threshold_sig.ecc.verify_signature(&public_key, message, &signature).unwrap();
        assert!(valid);
    }
}