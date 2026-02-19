use mpc_core::{
    key_management::KeyManager,
    protocol::ProtocolFactory,
    security::SecurityManager,
    types::{CurveType, KeyGenRequest, ProtocolType, ThresholdScheme},
};

#[tokio::test]
async fn test_key_generation_flow() {
    // 创建安全管理器
    let security_manager = SecurityManager::new().unwrap();
    
    // 创建协议工厂
    let protocol_factory = ProtocolFactory::new();
    
    // 创建密钥管理器
    let key_manager = KeyManager::new(protocol_factory, security_manager).unwrap();
    
    // 创建密钥生成请求
    let request = KeyGenRequest {
        session_id: "test_session_001".to_string(),
        scheme: ThresholdScheme {
            total_participants: 3,
            threshold: 2,
            curve_type: CurveType::Secp256k1,
        },
        protocol_type: ProtocolType::GG20,
    };
    
    // 生成密钥
    let response = key_manager.generate_key(request).await.unwrap();
    
    // 验证响应
    assert_eq!(response.session_id, "test_session_001");
    assert_eq!(response.public_key.curve_type, CurveType::Secp256k1);
    assert_eq!(response.key_shares.len(), 3);
    assert_eq!(response.status, mpc_core::types::SessionStatus::Completed);
    
    // 验证公钥格式（33字节压缩公钥）
    assert_eq!(response.public_key.bytes.len(), 33);
    
    // 验证密钥分片
    for (i, share) in response.key_shares.iter().enumerate() {
        assert_eq!(share.index, (i + 1) as u32);
        assert!(share.share_data.len() > 0);
        assert_eq!(share.curve_type, CurveType::Secp256k1);
    }
}

#[tokio::test]
async fn test_signature_flow() {
    // 创建安全管理器
    let security_manager = SecurityManager::new().unwrap();
    
    // 创建协议工厂
    let protocol_factory = ProtocolFactory::new();
    
    // 创建密钥管理器
    let key_manager = KeyManager::new(protocol_factory, security_manager).unwrap();
    
    // 先生成密钥
    let key_request = KeyGenRequest {
        session_id: "test_session_sign".to_string(),
        scheme: ThresholdScheme {
            total_participants: 2,
            threshold: 2,
            curve_type: CurveType::Secp256k1,
        },
        protocol_type: ProtocolType::GG20,
    };
    
    let key_response = key_manager.generate_key(key_request).await.unwrap();
    
    // 创建签名请求
    let sign_request = mpc_core::types::SignRequest {
        session_id: "test_session_sign".to_string(),
        message: b"test message to sign".to_vec(),
        key_shares: key_response.key_shares.clone(),
    };
    
    // 执行签名
    let sign_response = key_manager.sign(sign_request).await.unwrap();
    
    // 验证签名响应
    assert_eq!(sign_response.session_id, "test_session_sign");
    assert!(sign_response.signature.bytes.len() > 0);
    assert_eq!(sign_response.status, mpc_core::types::SessionStatus::Completed);
    
    // 验证签名
    let verify_result = key_manager
        .verify_signature(
            &"test_session_sign".to_string(),
            &b"test message to sign".to_vec(),
            &sign_response.signature,
        )
        .await
        .unwrap();
    
    assert!(verify_result);
}

#[tokio::test]
async fn test_error_handling() {
    // 创建安全管理器
    let security_manager = SecurityManager::new().unwrap();
    
    // 创建协议工厂
    let protocol_factory = ProtocolFactory::new();
    
    // 创建密钥管理器
    let key_manager = KeyManager::new(protocol_factory, security_manager).unwrap();
    
    // 测试无效的会话ID
    let invalid_request = KeyGenRequest {
        session_id: "".to_string(), // 空会话ID
        scheme: ThresholdScheme {
            total_participants: 0, // 无效的参与者数量
            threshold: 0,          // 无效的门限值
            curve_type: CurveType::Secp256k1,
        },
        protocol_type: ProtocolType::GG20,
    };
    
    // 应该返回错误
    let result = key_manager.generate_key(invalid_request).await;
    assert!(result.is_err());
    
    // 测试不存在的会话
    let sign_request = mpc_core::types::SignRequest {
        session_id: "non_existent_session".to_string(),
        message: b"test".to_vec(),
        key_shares: vec![],
    };
    
    let result = key_manager.sign(sign_request).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_concurrent_operations() {
    // 创建安全管理器
    let security_manager = SecurityManager::new().unwrap();
    
    // 创建协议工厂
    let protocol_factory = ProtocolFactory::new();
    
    // 创建密钥管理器
    let key_manager = std::sync::Arc::new(KeyManager::new(protocol_factory, security_manager).unwrap());
    
    let mut handles = vec![];
    
    // 并发生成多个密钥
    for i in 0..5 {
        let key_manager_clone = key_manager.clone();
        
        let handle = tokio::spawn(async move {
            let request = KeyGenRequest {
                session_id: format!("concurrent_session_{}", i),
                scheme: ThresholdScheme {
                    total_participants: 3,
                    threshold: 2,
                    curve_type: CurveType::Secp256k1,
                },
                protocol_type: ProtocolType::GG20,
            };
            
            let response = key_manager_clone.generate_key(request).await.unwrap();
            
            // 验证响应
            assert_eq!(response.session_id, format!("concurrent_session_{}", i));
            assert_eq!(response.key_shares.len(), 3);
            assert_eq!(response.status, mpc_core::types::SessionStatus::Completed);
            
            response
        });
        
        handles.push(handle);
    }
    
    // 等待所有任务完成
    let results = futures::future::join_all(handles).await;
    
    // 验证所有任务都成功完成
    for result in results {
        assert!(result.is_ok());
    }
}

#[test]
fn test_security_manager() {
    // 测试安全管理器
    let security_manager = SecurityManager::new().unwrap();
    
    // 测试随机数生成
    let random1 = security_manager.secure_random(32);
    let random2 = security_manager.secure_random(32);
    
    assert_eq!(random1.len(), 32);
    assert_eq!(random2.len(), 32);
    assert_ne!(random1, random2); // 两次生成的随机数应该不同
    
    // 测试加密解密
    let plaintext = b"test secret message".to_vec();
    let key = security_manager.secure_random(32);
    
    let ciphertext = security_manager.encrypt(&plaintext, &key).unwrap();
    let decrypted = security_manager.decrypt(&ciphertext, &key).unwrap();
    
    assert_eq!(plaintext, decrypted);
    
    // 测试使用不同密钥解密应该失败
    let wrong_key = security_manager.secure_random(32);
    let result = security_manager.decrypt(&ciphertext, &wrong_key);
    assert!(result.is_err());
}