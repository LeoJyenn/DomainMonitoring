#!/bin/bash

echo "=== 域名监控系统 - 直接部署 ==="
echo "确保您的服务器已安装Node.js v18或更高版本"

# 创建数据目录
echo "创建数据目录..."
mkdir -p data

# 设置npm镜像
echo "设置npm镜像为淘宝镜像..."
npm config set registry https://registry.npmmirror.com

# 安装依赖
echo "安装依赖（这可能需要几分钟时间）..."
npm install --registry=https://registry.npmmirror.com
if [ $? -ne 0 ]; then
    echo "依赖安装失败，尝试使用CNPM..."
    npm install -g cnpm --registry=https://registry.npmmirror.com
    cnpm install

    # 如果仍然失败，尝试使用国内CDN安装next
    if [ $? -ne 0 ]; then
        echo "使用CNPM安装失败，尝试直接安装关键依赖..."
        npm install next@15.2.3 react@18.3.1 react-dom@18.3.1 --registry=https://registry.npmmirror.com
    fi
fi

# 手动检查next命令是否可用，如果不可用则使用npx
NEXT_CMD="./node_modules/.bin/next"
if [ ! -f "$NEXT_CMD" ]; then
    echo "使用npx构建应用..."
    npx next build
else
    # 构建应用
    echo "构建应用..."
    npm run build
fi

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
