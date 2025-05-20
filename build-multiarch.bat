@echo off
echo 正在检查Docker buildx...

REM 确保已安装Docker和buildx
docker buildx version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Docker buildx未安装，请先安装Docker buildx
  exit /b 1
)

REM 创建buildx构建器实例(如果不存在)
docker buildx inspect multiarch-builder >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo 创建buildx构建器...
  docker buildx create --name multiarch-builder --use
)

REM 启动构建器
echo 启动buildx构建器...
docker buildx use multiarch-builder
docker buildx inspect --bootstrap

REM 构建多架构镜像
echo 开始构建多架构Docker镜像...
docker buildx build --platform linux/amd64,linux/arm/v7 ^
  -t domainmonitoring:latest ^
  --load ^
  .

echo 多架构镜像构建完成!
echo 可以通过 'docker-compose up -d' 启动服务 