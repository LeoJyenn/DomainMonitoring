#!/bin/bash

# 为多个架构构建Docker镜像的脚本
# 支持x86_64和ARMv7架构

# 确保已安装Docker和buildx
echo "正在检查Docker buildx..."
if ! docker buildx version >/dev/null 2>&1; then
    echo "Docker buildx未安装，请先安装Docker buildx"
    exit 1
fi

# 创建buildx构建器实例(如果不存在)
if ! docker buildx inspect multiarch-builder >/dev/null 2>&1; then
    echo "创建buildx构建器..."
    docker buildx create --name multiarch-builder --use
fi

# 启动构建器
echo "启动buildx构建器..."
docker buildx use multiarch-builder
docker buildx inspect --bootstrap

# 构建多架构镜像
echo "开始构建多架构Docker镜像..."
docker buildx build --platform linux/amd64,linux/arm/v7 \
    -t domainmonitoring:latest \
    --load \
    .

echo "多架构镜像构建完成!"
echo "可以通过 'docker-compose up -d' 启动服务"
 