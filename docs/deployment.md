# 域名监控系统部署指南

本文档提供了域名监控系统的详细部署步骤，包括Docker部署和手动部署方式。

## Docker部署（推荐）

### 前提条件

- 已安装Docker (20.10.0+)
- 已安装Docker Compose (2.0.0+)
- 服务器至少1GB内存

### 步骤

1. **克隆代码仓库**

   ```bash
   git clone <仓库URL>
   cd 域名监控
   ```

2. **单架构部署**

   如果您只需要在单一架构上部署（例如只在x86_64上），可以直接使用docker-compose:

   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **多架构部署**

   如果您需要同时支持x86_64和ARMv7架构，请使用提供的多架构构建脚本:

   **Linux/Mac OS:**
   ```bash
   chmod +x build-multiarch.sh
   ./build-multiarch.sh
   docker-compose up -d
   ```

   **Windows:**
   ```cmd
   build-multiarch.bat
   docker-compose up -d
   ```

4. **验证部署**

   访问 `http://<服务器IP>:9769` 验证系统是否已成功部署。
   默认登录凭据:
   - 用户名: admin
   - 密码: admin

5. **持久化数据**

   所有数据都存储在Docker卷`domain_data`中。即使容器重启，数据也会保留。
   如需备份数据:

   ```bash
   # 查找卷的位置
   docker volume inspect domain_data
   
   # 使用位置路径进行备份
   ```

## 手动部署

如果您不想使用Docker，也可以手动部署:

1. **安装Node.js**

   确保您安装了Node.js 18或更高版本。

2. **克隆代码并安装依赖**

   ```bash
   git clone <仓库URL>
   cd 域名监控
   npm install
   ```

3. **构建生产版本**

   ```bash
   npm run build
   ```

4. **启动服务**

   ```bash
   npm run start
   ```

5. **系统守护（可选）**

   在生产环境中，建议使用PM2等工具让应用持续运行:

   ```bash
   npm install -g pm2
   pm2 start npm --name "domain-monitor" -- start
   pm2 save
   ```

## 故障排除

1. **端口冲突**

   如果9769端口已被占用，请修改以下文件中的端口:
   - `docker-compose.yml`
   - `Dockerfile` (环境变量)
   - `package.json` (start脚本)

2. **Docker权限问题**

   Linux系统中可能需要sudo权限运行Docker命令，或将用户添加到docker组:
   
   ```bash
   sudo usermod -aG docker $USER
   # 需要重新登录才能生效
   ```

3. **内存不足**

   如果在构建过程中出现内存不足错误，可以增加服务器/Docker的可用内存，或尝试:
   
   ```bash
   NODE_OPTIONS=--max_old_space_size=2048 npm run build
   ``` 