#!/bin/bash

# 使用简化版Dockerfile构建镜像
echo "构建简化版Docker镜像..."
docker build -t domainmonitoring:simple -f Dockerfile.simple.new .

# 运行容器
echo "启动容器..."
docker run -d --name domainmonitoring \
    -p 9769:9769 \
    -v domain_data:/app/data \
    --restart always \
    domainmonitoring:simple

echo "应用已在Docker中启动，端口9769"
echo "查看日志: docker logs -f domainmonitoring"
