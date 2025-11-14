# 自有服务器部署指南

本指南将帮助你将后端服务部署到自有服务器，并使用 MySQL 数据库。

---

## 📋 目录

1. [环境要求](#环境要求)
2. [数据库配置](#数据库配置)
3. [服务器部署步骤](#服务器部署步骤)
4. [配置说明](#配置说明)
5. [启动和管理](#启动和管理)
6. [故障排查](#故障排查)

---

## 环境要求

### 服务器要求

- 操作系统：Linux（Ubuntu 20.04+ / CentOS 7+ 推荐）
- Python：3.9+
- MySQL：5.7+ 或 8.0+
- 内存：建议 1GB+
- 磁盘：建议 10GB+

### 本地环境

- SSH 客户端
- 代码编辑器

---

## 数据库配置

### 1. 创建 MySQL 数据库

登录到 MySQL 服务器：

```bash
mysql -h 10.130.147.121 -u root -p
# 输入密码: 123456
```

创建数据库：

```sql
-- 创建数据库
CREATE DATABASE football_betting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 查看数据库
SHOW DATABASES;

-- 退出
EXIT;
```

### 2. （可选）创建专用数据库用户

为了安全起见，建议创建一个专用的数据库用户而不是使用 root：

```sql
-- 创建用户
CREATE USER 'football_user'@'%' IDENTIFIED BY 'your_secure_password';

-- 授予权限
GRANT ALL PRIVILEGES ON football_betting.* TO 'football_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

---

## 服务器部署步骤

### 步骤 1：连接到服务器

```bash
ssh your_username@your_server_ip
```

### 步骤 2：安装 Python 和依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Python 3.9+
sudo apt install python3 python3-pip python3-venv -y

# 验证安装
python3 --version
pip3 --version
```

### 步骤 3：安装 MySQL 客户端库

```bash
sudo apt install libmysqlclient-dev -y
```

### 步骤 4：创建项目目录

```bash
# 创建应用目录
mkdir -p /opt/football-betting-api
cd /opt/football-betting-api
```

### 步骤 5：上传项目代码

**方式一：使用 Git（推荐）**

```bash
# 安装Git
sudo apt install git -y

# 克隆项目
git clone https://github.com/JetWong0810/football-rational-betting-tracker.git
cd football-rational-betting-tracker/server
```

**方式二：使用 SCP 上传**

在本地执行：

```bash
# 打包server目录
cd /Users/jetwong/Projects/uniapp/football-rational-betting-tracker
tar -czf server.tar.gz server/

# 上传到服务器
scp server.tar.gz your_username@your_server_ip:/opt/football-betting-api/

# 在服务器上解压
ssh your_username@your_server_ip
cd /opt/football-betting-api
tar -xzf server.tar.gz
cd server
```

### 步骤 6：创建 Python 虚拟环境

```bash
cd /opt/football-betting-api/server

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 升级pip
pip install --upgrade pip
```

### 步骤 7：安装 Python 依赖

```bash
# 确保在虚拟环境中
pip install -r requirements.txt
```

### 步骤 8：配置环境变量

创建 `.env` 文件：

```bash
# 复制示例文件
cp env.example .env

# 编辑配置
nano .env
```

填入以下内容（根据实际情况修改）：

```env
# 数据库类型
DB_TYPE=mysql

# MySQL 数据库配置
MYSQL_HOST=10.130.147.121
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=football_betting

# API 配置
SYNC_INTERVAL_SECONDS=600
HTTP_TIMEOUT=20
```

保存并退出（Ctrl+X，然后 Y，然后 Enter）

### 步骤 9：初始化数据库

```bash
# 确保在虚拟环境中
python3 -c "from database import init_db; init_db()"
```

或者手动导入 MySQL schema：

```bash
mysql -h 10.130.147.121 -u root -p football_betting < schema_mysql.sql
```

### 步骤 10：测试运行

```bash
# 临时运行测试
uvicorn main:app --host 0.0.0.0 --port 7001

# 在另一个终端测试
curl http://localhost:7001/api/health
```

如果返回 `{"status":"ok",...}` 则说明运行成功！

按 `Ctrl+C` 停止测试运行。

---

## 配置说明

### 环境变量详解

| 变量名                  | 说明                | 默认值   | 示例               |
| ----------------------- | ------------------- | -------- | ------------------ |
| `DB_TYPE`               | 数据库类型          | `sqlite` | `mysql`            |
| `MYSQL_HOST`            | MySQL 主机地址      | -        | `10.130.147.121`   |
| `MYSQL_PORT`            | MySQL 端口          | `3306`   | `3306`             |
| `MYSQL_USER`            | MySQL 用户名        | -        | `root`             |
| `MYSQL_PASSWORD`        | MySQL 密码          | -        | `123456`           |
| `MYSQL_DATABASE`        | 数据库名称          | -        | `football_betting` |
| `SYNC_INTERVAL_SECONDS` | 数据同步间隔（秒）  | `600`    | `600`              |
| `HTTP_TIMEOUT`          | HTTP 请求超时（秒） | `20`     | `20`               |

---

## 启动和管理

### 方式一：使用 systemd（推荐生产环境）

创建 systemd 服务文件：

```bash
sudo nano /etc/systemd/system/football-betting-api.service
```

填入以下内容：

```ini
[Unit]
Description=Football Betting API Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/football-betting-api/server
Environment="PATH=/opt/football-betting-api/server/venv/bin"
ExecStart=/opt/football-betting-api/server/venv/bin/uvicorn main:app --host 0.0.0.0 --port 7001 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start football-betting-api

# 设置开机自启动
sudo systemctl enable football-betting-api

# 查看服务状态
sudo systemctl status football-betting-api

# 查看日志
sudo journalctl -u football-betting-api -f
```

管理命令：

```bash
# 启动服务
sudo systemctl start football-betting-api

# 停止服务
sudo systemctl stop football-betting-api

# 重启服务
sudo systemctl restart football-betting-api

# 查看状态
sudo systemctl status football-betting-api

# 查看日志
sudo journalctl -u football-betting-api -n 100 --no-pager
```

### 方式二：使用 Supervisor

安装 Supervisor：

```bash
sudo apt install supervisor -y
```

创建配置文件：

```bash
sudo nano /etc/supervisor/conf.d/football-betting-api.conf
```

填入以下内容：

```ini
[program:football-betting-api]
directory=/opt/football-betting-api/server
command=/opt/football-betting-api/server/venv/bin/uvicorn main:app --host 0.0.0.0 --port 7001 --workers 2
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/football-betting-api.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=10
```

启动服务：

```bash
# 重新加载配置
sudo supervisorctl reread
sudo supervisorctl update

# 启动服务
sudo supervisorctl start football-betting-api

# 查看状态
sudo supervisorctl status football-betting-api
```

管理命令：

```bash
# 启动
sudo supervisorctl start football-betting-api

# 停止
sudo supervisorctl stop football-betting-api

# 重启
sudo supervisorctl restart football-betting-api

# 查看状态
sudo supervisorctl status

# 查看日志
sudo tail -f /var/log/football-betting-api.log
```

### 方式三：使用 Screen（简单测试）

```bash
# 安装screen
sudo apt install screen -y

# 创建新会话
screen -S football-api

# 在screen中启动服务
cd /opt/football-betting-api/server
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 7001

# 按 Ctrl+A 然后按 D 脱离screen

# 重新连接到screen
screen -r football-api

# 关闭screen
screen -S football-api -X quit
```

---

## 配置 Nginx 反向代理（可选）

### 1. 安装 Nginx

```bash
sudo apt install nginx -y
```

### 2. 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/football-betting-api
```

填入以下内容：

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 改为你的域名或IP

    location / {
        proxy_pass http://127.0.0.1:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/football-betting-api /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机自启动
sudo systemctl enable nginx
```

### 3. 配置 HTTPS（可选但推荐）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d your_domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 配置防火墙

### Ubuntu (UFW)

```bash
# 启用防火墙
sudo ufw enable

# 允许SSH
sudo ufw allow ssh

# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许API端口（如果不使用Nginx）
sudo ufw allow 7001/tcp

# 查看状态
sudo ufw status
```

### CentOS (firewalld)

```bash
# 启动防火墙
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 允许HTTP和HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 允许API端口
sudo firewall-cmd --permanent --add-port=7001/tcp

# 重新加载配置
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-all
```

---

## 自动化部署脚本

创建一个部署脚本方便更新：

```bash
nano /opt/football-betting-api/deploy.sh
```

填入以下内容：

```bash
#!/bin/bash
set -e

echo "🚀 开始部署..."

# 定义变量
APP_DIR="/opt/football-betting-api/server"
SERVICE_NAME="football-betting-api"

# 进入项目目录
cd $APP_DIR

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装/更新依赖
echo "📦 更新依赖..."
pip install -r requirements.txt

# 重启服务
echo "🔄 重启服务..."
sudo systemctl restart $SERVICE_NAME

# 检查服务状态
echo "✅ 检查服务状态..."
sleep 3
sudo systemctl status $SERVICE_NAME --no-pager

echo "🎉 部署完成！"
```

添加执行权限：

```bash
chmod +x /opt/football-betting-api/deploy.sh
```

使用部署脚本：

```bash
/opt/football-betting-api/deploy.sh
```

---

## 更新前端 API 配置

部署完成后，需要更新前端的 API 地址。

### 方式一：修改代码

编辑 `src/utils/http.js` 第 10 行：

```javascript
// 将此处改为你的服务器地址
return "http://your_server_ip:7001";

// 如果配置了Nginx和域名
return "https://your_domain.com";
```

### 方式二：使用环境变量（Vercel 部署）

在 Vercel 项目设置中添加环境变量：

- Name: `VITE_API_BASE_URL`
- Value: `http://your_server_ip:7001` 或 `https://your_domain.com`

---

## 故障排查

### 1. 服务无法启动

**检查日志：**

```bash
# systemd
sudo journalctl -u football-betting-api -n 100

# supervisor
sudo tail -f /var/log/football-betting-api.log
```

**常见问题：**

- 端口被占用：`sudo lsof -i:7001`
- 权限问题：检查文件所有者 `ls -la`
- 依赖缺失：重新安装 `pip install -r requirements.txt`

### 2. 无法连接 MySQL

**检查 MySQL 服务：**

```bash
# 测试连接
mysql -h 10.130.147.121 -u root -p

# 检查MySQL监听地址
sudo netstat -tulpn | grep mysql
```

**检查防火墙：**

```bash
# MySQL服务器需要允许3306端口
sudo ufw allow from your_app_server_ip to any port 3306
```

**检查 MySQL 配置：**

```bash
# 编辑MySQL配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 确保bind-address允许远程连接
bind-address = 0.0.0.0

# 重启MySQL
sudo systemctl restart mysql
```

### 3. API 请求超时

**增加超时时间：**

编辑 `.env` 文件：

```env
HTTP_TIMEOUT=60
```

重启服务。

### 4. 数据同步失败

**手动触发同步：**

```bash
curl -X POST http://localhost:7001/api/sync
```

**检查同步状态：**

```bash
curl http://localhost:7001/api/health
```

### 5. 查看实时日志

```bash
# systemd
sudo journalctl -u football-betting-api -f

# supervisor
sudo tail -f /var/log/football-betting-api.log

# nginx access log
sudo tail -f /var/log/nginx/access.log

# nginx error log
sudo tail -f /var/log/nginx/error.log
```

---

## 性能优化

### 1. 增加 Worker 数量

编辑 systemd 服务文件，增加 workers：

```ini
ExecStart=/opt/football-betting-api/server/venv/bin/uvicorn main:app --host 0.0.0.0 --port 7001 --workers 4
```

推荐 workers 数量：CPU 核心数 × 2 + 1

### 2. 启用 Gunicorn

安装 Gunicorn：

```bash
pip install gunicorn
```

使用 Gunicorn 启动：

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:7001
```

### 3. 配置 MySQL 连接池

编辑 `settings.py`，添加连接池配置：

```python
MYSQL_CONFIG = {
    # ... 现有配置 ...
    "max_connections": 10,
    "pool_name": "football_pool",
}
```

### 4. 启用 Nginx 缓存

在 Nginx 配置中添加缓存：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    # ... 其他proxy配置 ...
}
```

---

## 监控和维护

### 1. 设置日志轮转

创建日志轮转配置：

```bash
sudo nano /etc/logrotate.d/football-betting-api
```

填入：

```
/var/log/football-betting-api.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
```

### 2. 数据库备份

创建备份脚本：

```bash
nano /opt/football-betting-api/backup.sh
```

填入：

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -h 10.130.147.121 -u root -p123456 football_betting > $BACKUP_DIR/football_betting_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/football_betting_$DATE.sql"
```

添加到 crontab：

```bash
crontab -e

# 每天凌晨2点备份
0 2 * * * /opt/football-betting-api/backup.sh >> /var/log/mysql-backup.log 2>&1
```

---

## 安全建议

1. **使用非 root 用户运行服务**
2. **配置防火墙，只开放必要端口**
3. **使用强密码**
4. **定期更新系统和依赖包**
5. **启用 HTTPS**
6. **定期备份数据库**
7. **监控日志和异常**
8. **限制 API 访问频率**（可使用 Nginx limit_req）

---

## 快速命令参考

```bash
# 服务管理
sudo systemctl start football-betting-api     # 启动
sudo systemctl stop football-betting-api      # 停止
sudo systemctl restart football-betting-api   # 重启
sudo systemctl status football-betting-api    # 状态

# 查看日志
sudo journalctl -u football-betting-api -f    # 实时日志
sudo journalctl -u football-betting-api -n 100 # 最近100行

# 测试API
curl http://localhost:7001/api/health         # 健康检查
curl -X POST http://localhost:7001/api/sync   # 手动同步

# 数据库操作
mysql -h 10.130.147.121 -u root -p football_betting  # 连接数据库

# 更新部署
/opt/football-betting-api/deploy.sh           # 运行部署脚本
```

---

## 总结

完成以上步骤后，你的后端服务将：

✅ 运行在自有服务器上  
✅ 使用 MySQL 数据库存储数据  
✅ 配置了自动重启和日志管理  
✅ 具备基本的监控和备份机制

如有问题，请参考故障排查章节或查看日志。
