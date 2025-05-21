#!/bin/bash

echo "=== 域名监控系统 - Nginx+Node部署 ==="
echo "确保您的服务器已安装Node.js v18和Nginx"

# 检查Nginx是否安装
if ! command -v nginx &>/dev/null; then
    echo "错误: 未检测到Nginx，请先安装Nginx"
    echo "  Ubuntu/Debian: sudo apt install nginx"
    echo "  CentOS/RHEL: sudo yum install nginx"
    exit 1
fi

# 创建数据目录
echo "创建数据目录..."
mkdir -p data

# 安装依赖
echo "安装依赖（这可能需要几分钟时间）..."
npm install

# 构建应用
echo "构建应用..."
npm run build

# 获取服务器IP
SERVER_IP=$(hostname -I | awk '{print $1}')

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

# 检查配置是否有效
echo "检查Nginx配置..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "Nginx配置检查失败，请检查配置文件"
    exit 1
fi

echo "重启Nginx (需要sudo权限)"
sudo systemctl restart nginx

# 检查端口是否被占用
if lsof -Pi :9769 -sTCP:LISTEN -t >/dev/null ; then
    echo "警告: 端口9769已被占用，尝试关闭现有进程..."
    kill $(lsof -t -i:9769) 2>/dev/null || true
    sleep 2
fi

# 启动Node应用
echo "启动Node应用..."
nohup npm run start >app.log 2>&1 &

# 等待服务启动
echo "等待服务启动..."
sleep 5

echo "======================================================================================================================="
echo "应用已通过Nginx部署成功!"
echo "通过以下地址访问:"
echo "  - http://$SERVER_IP"
echo "  - http://您的域名 (如果已配置DNS)"
echo "======================================================================================================================="
echo "Node应用运行在后台，日志保存在: $(pwd)/app.log"
echo "Nginx配置文件位置: /etc/nginx/conf.d/domain-monitor.conf"
echo
echo "如需配置HTTPS，请使用Let's Encrypt:"
echo "  sudo apt install certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d 您的域名"
echo
echo "服务器重启后，您需要手动重启应用程序:"
echo "  cd $(pwd) && ./nginx-node-deploy.sh"
echo
echo "建议: 考虑使用PM2进行进程管理，以实现自动重启: ./deploy-pm2.sh"
