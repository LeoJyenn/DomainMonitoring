#!/bin/bash

echo "=== 域名监控系统 - 直接部署 ==="
echo "确保您的服务器已安装Node.js v18或更高版本"

# 创建数据目录
echo "创建数据目录..."
mkdir -p data

# 安装依赖
echo "安装依赖（这可能需要几分钟时间）..."
npm install

# 构建应用
echo "构建应用..."
npm run build

# 检查端口是否被占用
if lsof -Pi :9769 -sTCP:LISTEN -t >/dev/null; then
    echo "警告: 端口9769已被占用，尝试关闭现有进程..."
    kill $(lsof -t -i:9769) 2>/dev/null || true
    sleep 2
fi

# 启动应用
echo "启动应用..."
nohup npm run start >app.log 2>&1 &

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 输出IP地址信息
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "==============================================="
echo "应用已在后台启动!"
echo "访问地址: http://$SERVER_IP:9769"
echo "日志保存在: $(pwd)/app.log"
echo "==============================================="
echo "要查看日志，请运行: tail -f app.log"
