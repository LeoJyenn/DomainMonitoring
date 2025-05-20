# 域名监控系统构建指南

本文档详细说明了如何构建域名监控系统的生产版本。

## 前提条件

- Node.js 18.x 或更高版本
- npm 8.x 或更高版本
- 如需Docker构建，需要安装Docker和Docker Compose

## 标准构建流程

### 1. 安装依赖

```bash
npm install
```

### 2. 生成生产构建

```bash
npm run build
```

构建成功后，将在`.next`目录中生成生产文件。

### 3. 启动生产服务器

```bash
npm run start
```

服务将在http://localhost:9769上启动。

## Docker构建流程

### 1. 标准Docker构建

使用Docker Compose构建镜像:

```bash
docker-compose build
```

启动Docker容器:

```bash
docker-compose up -d
```

### 2. 多架构构建

本项目支持构建适用于不同CPU架构的Docker镜像:

#### Linux/Mac:

```bash
chmod +x build-multiarch.sh
./build-multiarch.sh
docker-compose up -d
```

#### Windows:

```cmd
build-multiarch.bat
docker-compose up -d
```

多架构构建支持:
- x86_64 (AMD64) - 适用于大多数服务器和VPS
- ARMv7 - 适用于树莓派等ARM设备

## 构建自定义

### 修改端口

如需更改默认的9769端口:

1. 修改`package.json`中的开发和启动脚本
2. 修改`Dockerfile`中的`PORT`环境变量
3. 修改`docker-compose.yml`中的端口映射

### 环境变量

构建时可使用的环境变量:

- `PORT`: 应用监听端口
- `NODE_ENV`: 环境模式（development/production）
- `DATA_PATH`: 数据存储路径

例如:

```bash
PORT=8080 npm run build
PORT=8080 npm run start
```

Docker中使用环境变量:

```bash
# 修改docker-production.env文件
PORT=8080
```

## 常见问题

### 构建失败：内存不足

增加Node.js可用内存:

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### 构建缓慢

确保使用的是生产模式构建:

```bash
NODE_ENV=production npm run build
```

### 网络问题

如果npm安装依赖时遇到网络问题，可尝试:

```bash
npm install --registry=https://registry.npmmirror.com
``` 