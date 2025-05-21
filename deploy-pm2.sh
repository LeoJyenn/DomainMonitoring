#!/bin/bash

echo "=== 域名监控系统 - PM2部署 ==="
echo "确保您的服务器已安装Node.js v18或更高版本"

# 创建数据目录
echo "创建数据目录..."
mkdir -p data

# 设置npm镜像
echo "设置npm镜像为淘宝镜像..."
npm config set registry https://registry.npmmirror.com

# 安装PM2（如果需要）
if ! command -v pm2 &>/dev/null; then
    echo "安装PM2..."
    npm install -g pm2 --registry=https://registry.npmmirror.com

    # 如果安装失败，可能需要sudo权限
    if ! command -v pm2 &>/dev/null; then
        echo "尝试使用sudo安装PM2（可能需要输入密码）..."
        sudo npm install -g pm2 --registry=https://registry.npmmirror.com
    fi
fi

# 检查PM2是否安装成功
if ! command -v pm2 &>/dev/null; then
    echo "错误: PM2安装失败，请手动安装后重试"
    echo "  sudo npm install -g pm2 --registry=https://registry.npmmirror.com"
    exit 1
fi

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

# 检查是否已有运行的实例
if pm2 list | grep -q "domain-monitor"; then
    echo "检测到已有运行实例，正在停止..."
    pm2 stop domain-monitor
    pm2 delete domain-monitor
fi

# 使用PM2启动应用
echo "使用PM2启动应用..."
pm2 start npm --name "domain-monitor" -- run start

# 保存PM2配置以便开机自启
echo "保存PM2配置..."
pm2 save

# 添加开机自启说明
echo "====================================================="
echo "应用已通过PM2启动!"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "访问地址: http://$SERVER_IP:9769"
echo "====================================================="
echo "PM2管理命令:"
echo "  - 查看日志: pm2 logs domain-monitor"
echo "  - 停止应用: pm2 stop domain-monitor"
echo "  - 重启应用: pm2 restart domain-monitor"
echo "  - 查看状态: pm2 status"
echo
echo "设置开机自启:"
echo "  运行: pm2 startup"
echo "  然后按照提示运行显示的命令"
