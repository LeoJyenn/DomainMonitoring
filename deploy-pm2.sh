#!/bin/bash

# 安装PM2（如果需要）
if ! command -v pm2 &>/dev/null; then
    echo "安装PM2..."
    npm install -g pm2
fi

# 安装依赖
echo "安装依赖..."
npm install --production

# 构建应用
echo "构建应用..."
npm run build

# 使用PM2启动应用
echo "使用PM2启动应用..."
pm2 start npm --name "domain-monitor" -- run start

echo "应用已通过PM2启动，端口9769"
echo "查看日志: pm2 logs domain-monitor"
echo "停止应用: pm2 stop domain-monitor"
