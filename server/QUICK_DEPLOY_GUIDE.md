# 快速部署指南 - 自有服务器

## 📦 一、准备工作

### 数据库配置

- **地址**: 10.130.147.121
- **端口**: 3306
- **用户**: root
- **密码**: 123456
- **数据库名**: football_betting

### 创建数据库

```bash
mysql -h 10.130.147.121 -u root -p123456 -e "CREATE DATABASE football_betting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 🚀 二、部署步骤（5 分钟）

### 1. 上传代码到服务器

```bash
# 在本地打包
cd /Users/jetwong/Projects/uniapp/football-rational-betting-tracker
tar -czf server.tar.gz server/

# 上传到服务器（替换your_server为实际服务器地址）
scp server.tar.gz user@your_server:/opt/

# SSH登录服务器
ssh user@your_server

# 解压
cd /opt
tar -xzf server.tar.gz
cd server
```

### 2. 运行部署脚本

```bash
# 一键部署
./scripts/deploy.sh
```

脚本将自动完成：

- ✅ 创建 Python 虚拟环境
- ✅ 安装所有依赖
- ✅ 配置环境变量
- ✅ 初始化 MySQL 数据库
- ✅ 测试服务启动

### 3. 配置 systemd 服务

```bash
# 复制服务文件
sudo cp scripts/football-betting-api.service /etc/systemd/system/

# 修改服务文件中的路径（如果不是/opt/football-betting-api）
sudo nano /etc/systemd/system/football-betting-api.service

# 启动服务
sudo systemctl daemon-reload
sudo systemctl start football-betting-api
sudo systemctl enable football-betting-api

# 查看状态
sudo systemctl status football-betting-api
```

### 4. 验证部署

```bash
# 测试健康检查
curl http://localhost:7001/api/health

# 测试获取比赛列表
curl http://localhost:7001/api/matches
```

---

## ⚙️ 三、配置说明

### 环境变量文件 (.env)

部署脚本会自动创建`.env`文件，默认配置如下：

```env
DB_TYPE=mysql
MYSQL_HOST=10.130.147.121
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=football_betting
SYNC_INTERVAL_SECONDS=600
HTTP_TIMEOUT=20
```

如需修改，编辑文件后重启服务：

```bash
nano .env
sudo systemctl restart football-betting-api
```

---

## 🔧 四、服务管理命令

```bash
# 启动服务
sudo systemctl start football-betting-api

# 停止服务
sudo systemctl stop football-betting-api

# 重启服务
sudo systemctl restart football-betting-api

# 查看状态
sudo systemctl status football-betting-api

# 查看实时日志
sudo journalctl -u football-betting-api -f

# 查看最近100行日志
sudo journalctl -u football-betting-api -n 100
```

---

## 🌐 五、更新前端配置

部署完成后，修改前端 API 地址：

### 方法一：直接修改代码

编辑 `src/utils/http.js` 第 10 行：

```javascript
// 改为你的服务器地址
return "http://your_server_ip:7001";
```

### 方法二：使用 Nginx 反向代理（推荐）

#### 1. 安装 Nginx

```bash
sudo apt install nginx -y
```

#### 2. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/football-betting-api
```

填入：

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 或使用IP地址

    location / {
        proxy_pass http://127.0.0.1:7001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/football-betting-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. 配置防火墙

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

然后前端 API 地址改为：

```javascript
return "http://your_domain.com"; // 或 http://your_server_ip
```

---

## 📊 六、数据库初始化验证

登录 MySQL 查看表结构：

```bash
mysql -h 10.130.147.121 -u root -p123456 football_betting

# 查看所有表
SHOW TABLES;

# 应该看到以下表：
# - matches
# - odds_win_draw_lose
# - odds_correct_score
# - odds_total_goals
# - odds_half_full_time
# - sync_status

# 退出
EXIT;
```

---

## 🔍 七、故障排查

### 问题 1：服务无法启动

```bash
# 查看详细日志
sudo journalctl -u football-betting-api -n 100

# 检查端口占用
sudo lsof -i:7001

# 手动测试启动
cd /opt/server
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 7001
```

### 问题 2：无法连接 MySQL

```bash
# 测试MySQL连接
mysql -h 10.130.147.121 -u root -p123456

# 检查MySQL是否允许远程连接
mysql -h 10.130.147.121 -u root -p123456 -e "SELECT host, user FROM mysql.user WHERE user='root';"

# 如果需要允许远程连接
mysql -h 10.130.147.121 -u root -p123456 -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456'; FLUSH PRIVILEGES;"
```

### 问题 3：API 返回错误

```bash
# 查看实时日志
sudo journalctl -u football-betting-api -f

# 测试数据同步
curl -X POST http://localhost:7001/api/sync

# 查看同步状态
curl http://localhost:7001/api/health
```

---

## 📱 八、API 测试

### 1. 健康检查

```bash
curl http://localhost:7001/api/health
```

预期响应：

```json
{
  "status": "ok",
  "sync": {
    "last_synced_at": "2024-01-01T12:00:00",
    "total_matches": 100,
    "total_odds": 500
  }
}
```

### 2. 获取比赛列表

```bash
curl http://localhost:7001/api/matches
```

### 3. 手动触发数据同步

```bash
curl -X POST http://localhost:7001/api/sync
```

### 4. 获取比赛详情

```bash
curl http://localhost:7001/api/matches/{match_id}
```

---

## 🔄 九、更新部署

当有代码更新时：

```bash
cd /opt/server
git pull origin main           # 如果使用Git
# 或重新上传并解压server.tar.gz

./scripts/deploy.sh            # 重新运行部署脚本
sudo systemctl restart football-betting-api  # 重启服务
```

---

## 📋 十、完整部署清单

- [ ] 创建 MySQL 数据库 `football_betting`
- [ ] 上传代码到服务器 `/opt/server`
- [ ] 运行部署脚本 `./scripts/deploy.sh`
- [ ] 配置 systemd 服务
- [ ] 启动并启用服务
- [ ] 测试 API 接口
- [ ] 配置 Nginx 反向代理（可选）
- [ ] 配置防火墙规则
- [ ] 更新前端 API 地址
- [ ] 测试前端访问
- [ ] 设置数据库定时备份（可选）

---

## 📞 支持

详细文档请参考：

- [完整部署文档](./DEPLOY_OWN_SERVER.md)
- [GitHub 仓库](https://github.com/JetWong0810/football-rational-betting-tracker)

---

## ⚠️ 安全提示

1. ✅ 生产环境请使用强密码
2. ✅ 建议创建专用数据库用户而不是使用 root
3. ✅ 配置防火墙只开放必要端口
4. ✅ 使用 Nginx 配置 HTTPS
5. ✅ 定期备份数据库
6. ✅ 定期更新系统和依赖

---

## 🎉 完成！

部署完成后，你的后端 API 将运行在：

- **本地访问**: `http://localhost:7001`
- **远程访问**: `http://your_server_ip:7001`
- **域名访问**: `http://your_domain.com` (如果配置了 Nginx)

API 文档地址：

- **Swagger UI**: `http://your_server_ip:7001/docs`
- **ReDoc**: `http://your_server_ip:7001/redoc`
