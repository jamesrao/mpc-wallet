//! MPC核心服务主程序

use mpc_core::server::start_server;
use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 初始化日志
    tracing_subscriber::fmt::init();
    
    // 设置服务器地址
    let addr = "0.0.0.0:8081";
    
    println!("启动MPC核心服务...");
    println!("服务器地址: {}", addr);
    println!("服务已启动，等待连接...");
    
    // 启动服务器
    if let Err(e) = start_server(addr).await {
        eprintln!("服务器启动失败: {}", e);
        std::process::exit(1);
    }
    
    Ok(())
}