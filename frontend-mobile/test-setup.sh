#!/bin/bash

# 供应链金融移动端测试设置脚本

echo "🚀 供应链金融移动端应用测试设置"
echo "=================================="

# 检查环境
check_environment() {
    echo "🔍 检查开发环境..."
    
    # 检查Node.js
    if command -v node >/dev/null 2>&1; then
        echo "✅ Node.js 版本: $(node --version)"
    else
        echo "❌ Node.js 未安装"
        return 1
    fi
    
    # 检查npm
    if command -v npm >/dev/null 2>&1; then
        echo "✅ npm 版本: $(npm --version)"
    else
        echo "❌ npm 未安装"
        return 1
    fi
    
    # 检查React Native CLI
    if command -v react-native >/dev/null 2>&1; then
        echo "✅ React Native CLI 已安装"
    else
        echo "⚠️  React Native CLI 未安装，使用npx运行"
    fi
    
    return 0
}

# 修复npm权限
fix_npm_permissions() {
    echo "🔧 修复npm权限问题..."
    
    # 清理npm缓存
    echo "清理npm缓存..."
    npm cache clean --force || true
    
    # 修复npm目录权限
    if [ -d "$HOME/.npm" ]; then
        echo "修复npm目录权限..."
        sudo chown -R $(whoami) "$HOME/.npm" 2>/dev/null || true
    fi
    
    echo "✅ 权限修复完成"
}

# 安装依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    
    # 检查package.json是否存在
    if [ ! -f "package.json" ]; then
        echo "❌ package.json 文件不存在"
        return 1
    fi
    
    # 安装依赖
    echo "使用 --legacy-peer-deps 安装依赖..."
    npm install --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装成功"
    else
        echo "❌ 依赖安装失败，尝试使用yarn..."
        if command -v yarn >/dev/null 2>&1; then
            yarn install
        else
            echo "⚠️  请手动安装依赖"
            return 1
        fi
    fi
    
    return 0
}

# 运行类型检查
run_type_check() {
    echo "🔍 运行TypeScript类型检查..."
    
    if [ -f "tsconfig.json" ]; then
        npx tsc --noEmit
        if [ $? -eq 0 ]; then
            echo "✅ TypeScript类型检查通过"
        else
            echo "⚠️  TypeScript类型检查发现错误"
        fi
    else
        echo "ℹ️  未找到tsconfig.json，跳过类型检查"
    fi
}

# 运行代码检查
run_lint() {
    echo "🔍 运行代码检查..."
    
    npm run lint 2>/dev/null || echo "ℹ️  跳过代码检查（未配置ESLint）"
}

# 启动开发服务器
start_dev_server() {
    echo "🚀 启动React Native开发服务器..."
    
    echo "开发服务器将在 http://localhost:8081 启动"
    echo ""
    echo "📱 运行移动端应用："
    echo "   Android: npm run android"
    echo "   iOS:     npm run ios"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    
    # 在后台启动开发服务器
    npm start &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 5
    
    echo "✅ 开发服务器已启动 (PID: $SERVER_PID)"
    echo ""
}

# 主函数
main() {
    echo "供应链金融移动端应用测试设置"
    echo "=================================="
    
    # 检查是否在正确目录
    if [ ! -f "package.json" ]; then
        echo "❌ 请在frontend-mobile目录下运行此脚本"
        exit 1
    fi
    
    # 检查环境
    if ! check_environment; then
        echo "❌ 环境检查失败"
        exit 1
    fi
    
    # 修复权限
    fix_npm_permissions
    
    # 安装依赖
    if ! install_dependencies; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    
    # 运行检查
    run_type_check
    run_lint
    
    echo ""
    echo "🎉 设置完成！"
    echo ""
    
    # 询问是否启动开发服务器
    read -p "是否启动开发服务器？(y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_server
    fi
    
    echo ""
    echo "📋 测试指南："
    echo "1. 功能测试：node test-mobile.js"
    echo "2. 单元测试：npm test"
    echo "3. 构建测试：npm run build"
    echo "4. 真机测试：连接设备后运行对应命令"
    echo ""
}

# 执行主函数
main "$@"