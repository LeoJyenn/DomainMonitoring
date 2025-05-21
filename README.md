# 域名监控系统

域名监控系统是一个用于跟踪和管理域名到期时间的应用程序。它可以帮助您避免域名过期带来的问题

## 功能特点

- 域名到期时间监控
- 简洁美观的用户界面
- 支持添加、编辑和删除域名
- 数据持久化存储

## 技术栈

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS

## 快速开始

所有部署方法的前置步骤：

1. 克隆仓库:
   ```bash
   git clone https://github.com/LeoJyenn/DomainMonitoring.git
   ```

2. 进入项目目录:
   ```bash
   cd DomainMonitoring  
   ```

### VPS部署选项

#### 1. 使用PM2进程管理器部署（推荐）

PM2是Node.js应用程序的进程管理器，可以保持应用程序持续运行。

1. 确保系统已安装Node.js (推荐v18或更高版本)

2. 为脚本添加执行权限:
   ```bash
   chmod +x deploy-pm2.sh
   ```

3. 运行PM2部署脚本:
   ```bash
   ./deploy-pm2.sh
   ```

4. 访问应用:
   浏览器中打开 `http://服务器IP:9769`

**PM2管理命令:**
- 查看日志: `pm2 logs domain-monitor`
- 停止应用: `pm2 stop domain-monitor`
- 重启应用: `pm2 restart domain-monitor`
- 设置开机自启: `pm2 startup` 然后按提示执行命令，最后 `pm2 save`

#### 2. 使用Nginx+Node部署

适合需要配置域名访问的生产环境。

1. 确保系统已安装Node.js和Nginx

2. 为脚本添加执行权限:
   ```bash
   chmod +x nginx-node-deploy.sh
   ```

3. 运行Nginx部署脚本:
   ```bash
   ./nginx-node-deploy.sh
   ```

4. 访问应用:
   浏览器中打开服务器IP地址或配置的域名

**注意：** 如果需要配置HTTPS，请修改生成的Nginx配置文件，添加SSL证书配置。

#### 3. 直接部署（简单方式）

适合临时测试或个人使用。

1. 确保系统已安装Node.js (推荐v18或更高版本)

2. 为脚本添加执行权限:
   ```bash
   chmod +x deploy.sh
   ```

3. 运行部署脚本:
   ```bash
   ./deploy.sh
   ```

4. 访问应用:
   浏览器中打开 `http://服务器IP:9769`

**注意：** 此方法在终端关闭后会继续在后台运行，日志保存在app.log文件中。

#### 4. 使用系统服务实现自启动（适用于大多数Linux服务器）

在VPS中设置系统服务，实现服务器重启后自动启动应用：

1. 确保系统已安装Node.js (推荐v18或更高版本)

2. 为脚本添加执行权限:
   ```bash
   chmod +x vps-autostart.sh
   ```

3. 运行自启动配置脚本:
   ```bash
   ./vps-autostart.sh
   ```

4. 访问应用:
   浏览器中打开 `http://服务器IP:9769`

**系统服务管理命令:**
- 检查状态: `sudo systemctl status domain-monitor.service`
- 启动服务: `sudo systemctl start domain-monitor.service`
- 停止服务: `sudo systemctl stop domain-monitor.service`
- 查看日志: `sudo journalctl -u domain-monitor.service`

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

系统使用文件系统存储域名数据，确保数据不会丢失。数据文件保存在项目根目录的`data`文件夹中。

## 支持的架构

- x86_64 (大多数VPS和服务器)
- ARMv7 (如Raspberry Pi等ARM设备)

## 端口配置

默认情况下，应用运行在`9769`端口。如需修改，请更新以下文件:
- `package.json`中的开发和启动脚本
- 如果使用Nginx，需更新Nginx配置中的代理端口

## 配置

默认用户名/密码为:
- 用户名: admin
- 密码: admin

首次登录后，请在设置中修改密码。
