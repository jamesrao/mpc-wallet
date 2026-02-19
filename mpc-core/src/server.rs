//! MPC服务器实现

use crate::error::{MpcError, Result};
use crate::key_management::KeyManager;
use crate::security::SecurityManager;
use crate::types::{KeyGenRequest, SignRequest, VerifyRequest, SessionStatus, PublicKey, VerifyResponse};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use warp::{Filter, Rejection, Reply};

/// MPC服务器
pub struct MpcServer {
    /// 密钥管理器
    key_manager: Arc<RwLock<KeyManager>>,
    /// 会话存储
    sessions: Arc<RwLock<HashMap<String, SessionStatus>>>,
}

impl MpcServer {
    /// 创建新的MPC服务器
    pub fn new() -> Result<Self> {
        let security_manager = Arc::new(SecurityManager::new(
            crate::types::SecurityConfig {
                enable_sgx: false,
                enable_hsm: false,
                enable_tee: false,
                encryption_algorithm: "AES-GCM".to_string(),
                key_rotation_interval: 86400, // 1天
            }
        )?);

        let key_manager = KeyManager::new(
            crate::types::ProtocolType::Gg18,
            security_manager,
        )?;

        Ok(Self {
            key_manager: Arc::new(RwLock::new(key_manager)),
            sessions: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    /// 启动服务器
    pub async fn run(&self, addr: &str) -> Result<()> {
        // 为每个路由创建独立的变量副本
        let key_manager_for_key_gen = self.key_manager.clone();
        let sessions_for_key_gen = self.sessions.clone();
        
        let key_manager_for_sign = self.key_manager.clone();
        let sessions_for_sign = self.sessions.clone();
        
        let key_manager_for_verify = self.key_manager.clone();
        
        let sessions_for_status = self.sessions.clone();
        
        let key_manager_for_public_key = self.key_manager.clone();

        // 健康检查路由
        let health = warp::path!("health")
            .and(warp::get())
            .map(|| warp::reply::json(&HealthResponse { status: "healthy" }));

        // 密钥生成路由
        let key_gen = warp::path!("api" / "v1" / "keygen")
            .and(warp::post())
            .and(warp::body::json())
            .and_then(move |request: KeyGenRequest| {
                let key_manager = key_manager_for_key_gen.clone();
                let sessions = sessions_for_key_gen.clone();
                
                async move {
                    let mut manager = key_manager.write().await;
                    let mut session_store = sessions.write().await;
                    
                    // 更新会话状态
                    session_store.insert(request.session_id.clone(), SessionStatus::InProgress);
                    
                    match manager.generate_key(request.clone()) {
                        Ok(response) => {
                            session_store.insert(request.session_id.clone(), SessionStatus::Completed);
                            Ok::<_, Rejection>(warp::reply::json(&response))
                        }
                        Err(e) => {
                            session_store.insert(request.session_id.clone(), SessionStatus::Failed);
                            Err(warp::reject::custom(ApiError::from(e)))
                        }
                    }
                }
            });

        // 签名路由
        let sign = warp::path!("api" / "v1" / "sign")
            .and(warp::post())
            .and(warp::body::json())
            .and_then(move |request: SignRequest| {
                let key_manager = key_manager_for_sign.clone();
                let sessions = sessions_for_sign.clone();
                
                async move {
                    let manager = key_manager.read().await;
                    let mut session_store = sessions.write().await;
                    
                    session_store.insert(request.session_id.clone(), SessionStatus::InProgress);
                    
                    match manager.sign(request.clone()) {
                        Ok(response) => {
                            session_store.insert(request.session_id.clone(), SessionStatus::Completed);
                            Ok::<_, Rejection>(warp::reply::json(&response))
                        }
                        Err(e) => {
                            session_store.insert(request.session_id.clone(), SessionStatus::Failed);
                            Err(warp::reject::custom(ApiError::from(e)))
                        }
                    }
                }
            });

        // 验证路由
        let verify = warp::path!("api" / "v1" / "verify")
            .and(warp::post())
            .and(warp::body::json())
            .and_then(move |request: VerifyRequest| {
                let key_manager = key_manager_for_verify.clone();
                
                async move {
                    let manager = key_manager.read().await;
                    
                    match manager.verify_signature(&request.session_id, &request.message, &request.signature) {
                        Ok(valid) => {
                            Ok::<_, Rejection>(warp::reply::json(&VerifyResponse { valid }))
                        }
                        Err(e) => Err(warp::reject::custom(ApiError::from(e))),
                    }
                }
            });

        // 会话状态路由
        let session_status = warp::path!("api" / "v1" / "session" / String)
            .and(warp::get())
            .and_then(move |session_id: String| {
                let sessions = sessions_for_status.clone();
                
                async move {
                    let session_store = sessions.read().await;
                    
                    match session_store.get(&session_id) {
                        Some(status) => {
                            Ok::<_, Rejection>(warp::reply::json(&SessionStatusResponse {
                                session_id,
                                status: *status,
                            }))
                        }
                        None => Err(warp::reject::not_found()),
                    }
                }
            });

        // 公钥获取路由
        let public_key = warp::path!("api" / "v1" / "key" / String / "public")
            .and(warp::get())
            .and_then(move |session_id: String| {
                let key_manager = key_manager_for_public_key.clone();
                
                async move {
                    let manager = key_manager.read().await;
                    
                    match manager.get_public_key(&session_id) {
                        Ok(pub_key) => {
                            Ok::<_, Rejection>(warp::reply::json(&PublicKeyResponse {
                                session_id,
                                public_key: pub_key,
                            }))
                        }
                        Err(e) => Err(warp::reject::custom(ApiError::from(e))),
                    }
                }
            });

        // 组合所有路由
        let routes = health
            .or(key_gen)
            .or(sign)
            .or(verify)
            .or(session_status)
            .or(public_key)
            .recover(handle_rejection)
            .with(warp::cors().allow_any_origin());

        // 启动服务器
        println!("MPC服务器启动在: {}", addr);
        let socket_addr: std::net::SocketAddr = addr.parse().unwrap();
        warp::serve(routes).run(socket_addr).await;
        
        Ok(())
    }
}

/// 健康检查响应
#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
}

/// 会话状态响应
#[derive(Serialize)]
struct SessionStatusResponse {
    session_id: String,
    status: SessionStatus,
}

/// 公钥响应
#[derive(Serialize)]
struct PublicKeyResponse {
    session_id: String,
    public_key: PublicKey,
}

/// API错误
#[derive(Debug)]
struct ApiError(MpcError);

impl From<MpcError> for ApiError {
    fn from(error: MpcError) -> Self {
        Self(error)
    }
}

impl warp::reject::Reject for ApiError {}

/// 处理拒绝
async fn handle_rejection(err: Rejection) -> std::result::Result<impl Reply, Rejection> {
    if let Some(api_error) = err.find::<ApiError>() {
        let json = warp::reply::json(&ErrorResponse {
            error: api_error.0.to_string(),
        });
        Ok(warp::reply::with_status(json, warp::http::StatusCode::BAD_REQUEST))
    } else {
        Err(err)
    }
}

/// 错误响应
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

/// 服务器启动函数
pub async fn start_server(addr: &str) -> Result<()> {
    let server = MpcServer::new()?;
    server.run(addr).await
}