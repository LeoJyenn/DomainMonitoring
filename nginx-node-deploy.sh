#!/bin/bash

# 安装依赖
echo "安装依赖..."
npm install --production

# 构建应用
echo "构建应用..."
npm run build

# 创建Nginx配置
echo "配置Nginx..."
cat >domain-monitor.conf <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:9769;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo "将Nginx配置复制到/etc/nginx/conf.d/ (需要sudo权限)"
sudo cp domain-monitor.conf /etc/nginx/conf.d/

echo "重启Nginx (需要sudo权限)"
sudo systemctl restart nginx

# 启动Node应用
echo "启动Node应用..."
nohup npm run start >app.log 2>&1 &

echo "应用已通过Nginx部署"
echo "Node应用运行在端口9769，通过Nginx提供Web服务"
