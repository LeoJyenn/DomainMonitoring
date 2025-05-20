# 域名监控系统

域名监控系统是一个用于跟踪和管理域名到期时间的应用程序。它可以帮助您避免域名过期带来的问题

## 功能特点

- 域名到期时间监控
- 简洁美观的用户界面
- 支持添加、编辑和删除域名
- 数据持久化存储
- Docker容器化部署

## 技术栈

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Docker

## 快速开始

### 使用Docker运行（推荐）

1. 确保您的系统已安装Docker和Docker Compose

2. 克隆仓库:
   ```bash
   git clone https://github.com/LeoJyenn/DomainMonitoring.git
   cd DomainMonitoring
   ```

3. 构建并启动容器:
   ```bash
   # 构建Docker镜像
   docker-compose build
   
   # 在后台启动服务
   docker-compose up -d
   ```

4. 访问应用:
   浏览器中打开 `http://localhost:9769`

### 其他部署方式

所有部署方法的前置步骤：

1. 克隆仓库（如果还没有）:
   ```bash
   git clone https://github.com/LeoJyenn/DomainMonitoring.git
   ```

2. 进入项目目录:
   ```bash
   cd DomainMonitoring  
   ```

#### 1. 使用简化版Docker（更快的构建）

1. 确保系统已安装Docker

2. 为脚本添加执行权限（Linux/MacOS）:
   ```bash
   chmod +x docker-simple.sh
   ```
   
   Windows用户可跳过此步骤，直接使用:
   ```powershell
   # PowerShell
   .\docker-simple.sh
   ```
   
   或者:
   ```cmd
   # CMD
   bash docker-simple.sh
   ```

3. 运行脚本构建并启动:
   ```bash
   ./docker-simple.sh  # Linux/MacOS
   ```

4. 访问应用:
   浏览器中打开 `http://localhost:9769`

#### 2. 直接本地部署（无需Docker）

1. 确保系统已安装Node.js (推荐v18或更高版本)

2. 为脚本添加执行权限（Linux/MacOS）:
   ```bash
   chmod +x deploy.sh
   ```
   
   Windows用户可跳过此步骤，直接使用:
   ```powershell
   # PowerShell
   .\deploy.sh
   ```
   
   或者:
   ```cmd
   # CMD
   bash deploy.sh
   ```

3. 运行部署脚本:
   ```bash
   ./deploy.sh  # Linux/MacOS
   ```

4. 访问应用:
   浏览器中打开 `http://localhost:9769`

#### 3. 使用PM2进程管理器部署

1. 确保系统已安装Node.js (推荐v18或更高版本)

2. 为脚本添加执行权限（Linux/MacOS）:
   ```bash
   chmod +x deploy-pm2.sh
   ```
   
   Windows用户可跳过此步骤，直接使用:
   ```powershell
   # PowerShell
   .\deploy-pm2.sh
   ```
   
   或者:
   ```cmd
   # CMD
   bash deploy-pm2.sh
   ```

3. 运行PM2部署脚本:
   ```bash
   ./deploy-pm2.sh  # Linux/MacOS
   ```

4. 访问应用:
   浏览器中打开 `http://localhost:9769`

#### 4. 使用Nginx+Node部署

1. 确保系统已安装Node.js和Nginx

2. 为脚本添加执行权限（Linux/MacOS）:
   ```bash
   chmod +x nginx-node-deploy.sh
   ```
   
   Windows用户注意：此部署方式主要针对Linux系统，Windows用户需要手动配置Nginx

3. 运行Nginx部署脚本:
   ```bash
   ./nginx-node-deploy.sh  # Linux/MacOS
   ```

4. 访问应用:
   浏览器中打开服务器IP地址或域名

### 手动开发/运行

1. 安装依赖:
   ```bash
   npm install
   ```

2. 开发模式:
   ```bash
   npm run dev
   ```

3. 构建生产版本:
   ```bash
   npm run build
   ```

4. 启动生产服务器:
   ```bash
   npm run start
   ```

## 数据持久化

系统配置了持久化卷存储，您的域名数据将保存在Docker卷`domain_data`中。即使容器重启或更新，数据也不会丢失。

## 支持的架构

- x86_64 (大多数VPS和服务器)
- ARMv7 (如Raspberry Pi等ARM设备)

## 端口配置

默认情况下，应用运行在`9769`端口。如需修改，请更新以下文件:
- `docker-compose.yml`中的端口映射
- `Dockerfile`中的`PORT`环境变量
- `package.json`中的开发和启动脚本

## 配置

默认用户名/密码为:
- 用户名: admin
- 密码: admin

首次登录后，请在设置中修改密码。
