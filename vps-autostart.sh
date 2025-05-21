#!/bin/bash

echo "=== 域名监控系统 - 创建系统服务 ==="
echo "此脚本将创建系统服务以便应用在服务器重启后自动启动"

# 获取当前目录的绝对路径
APP_DIR=$(pwd)
APP_USER=$(whoami)

# 创建服务文件
SERVICE_FILE="domain-monitor.service"
cat >$SERVICE_FILE <<EOF
[Unit]
Description=Domain Monitoring System
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=domain-monitor

[Install]
WantedBy=multi-user.target
EOF

echo "服务文件已创建: $SERVICE_FILE"

# 复制服务文件并启用服务
echo "复制服务文件到系统目录并启用服务（需要sudo权限）"
sudo cp $SERVICE_FILE /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable domain-monitor.service

echo "启动服务..."
sudo systemctl start domain-monitor.service

echo "========================================================"
echo "系统服务已创建并启用!"
echo "服务状态: sudo systemctl status domain-monitor.service"
echo "启动服务: sudo systemctl start domain-monitor.service"
echo "停止服务: sudo systemctl stop domain-monitor.service"
echo "重启服务: sudo systemctl restart domain-monitor.service"
echo "查看日志: sudo journalctl -u domain-monitor.service"
echo "========================================================"
