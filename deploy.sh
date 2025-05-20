#!/bin/bash

# 安装依赖
echo "安装依赖..."
npm install --production

# 构建应用
echo "构建应用..."
npm run build

# 启动应用
echo "启动应用..."
nohup npm run start >app.log 2>&1 &

echo "应用已在后台启动，端口9769"
echo "日志保存在 app.log"
