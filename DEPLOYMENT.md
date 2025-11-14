# 足彩理性投资助手 - 部署指南

## 目录

1. [H5 部署（Vercel）](#h5部署vercel)
2. [微信小程序部署](#微信小程序部署)
3. [后端 API 部署（Render）](#后端api部署render)
4. [环境变量配置](#环境变量配置)

---

## H5 部署（Vercel）

### 前置条件

- GitHub 账号
- Vercel 账号（使用 GitHub 登录即可）

### 部署步骤

#### 1. 构建 H5 版本

```bash
cd /Users/jetwong/Projects/uniapp/football-rational-betting-tracker
npm install
npm run build:h5
```

构建完成后，会在 `dist/build/h5` 目录生成静态文件。

#### 2. 推送代码到 GitHub

```bash
# 初始化git仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 创建GitHub仓库后关联
git remote add origin https://github.com/你的用户名/football-rational-betting-tracker.git
git branch -M main
git push -u origin main
```

#### 3. 在 Vercel 部署

**方式一：通过 Vercel 网站（推荐新手）**

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - Framework Preset: `Other`
   - Build Command: `npm run build:h5`
   - Output Directory: `dist/build/h5`
   - Install Command: `npm install`
6. 点击 "Deploy"

**方式二：使用 Vercel CLI**

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署
cd /Users/jetwong/Projects/uniapp/football-rational-betting-tracker
vercel --prod
```

#### 4. 配置 vercel.json（可选，优化部署）

在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "npm run build:h5",
  "outputDirectory": "dist/build/h5",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 微信小程序部署

### 前置条件

- 微信小程序账号（个人/企业）
- 微信开发者工具

### 部署步骤

#### 1. 注册微信小程序

1. 访问 https://mp.weixin.qq.com
2. 注册小程序账号（个人免费，300 元认证费可选）
3. 获取 AppID（在设置 -> 开发设置中）

#### 2. 配置 manifest.json

```bash
# 编辑 src/manifest.json，填入你的AppID
```

```json
{
  "mp-weixin": {
    "appid": "你的微信小程序AppID",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true
  }
}
```

#### 3. 构建小程序版本

```bash
cd /Users/jetwong/Projects/uniapp/football-rational-betting-tracker
npm run build:mp-weixin
```

构建完成后，会在 `dist/build/mp-weixin` 目录生成小程序代码。

#### 4. 使用微信开发者工具上传

1. 下载并安装微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 打开微信开发者工具
3. 导入项目：
   - 项目目录：`/Users/jetwong/Projects/uniapp/football-rational-betting-tracker/dist/build/mp-weixin`
   - AppID：填入你的小程序 AppID
   - 项目名称：随意填写
4. 点击右上角"上传"按钮
5. 填写版本号和项目备注
6. 上传成功后，登录微信小程序后台提交审核

#### 5. 审核与发布

1. 登录 https://mp.weixin.qq.com
2. 进入"管理" -> "版本管理"
3. 将开发版本提交审核
4. 审核通过后（一般 1-3 天），点击发布即可上线

---

## 后端 API 部署（Render）

### 前置条件

- GitHub 账号
- Render 账号（使用 GitHub 登录即可）

### 部署步骤

#### 1. 准备后端代码

**创建 render.yaml（可选，自动配置）**

```yaml
services:
  - type: web
    name: football-betting-api
    env: python
    buildCommand: "cd server && pip install -r requirements.txt"
    startCommand: "cd server && uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
```

**创建 server/Procfile（可选）**

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### 2. 推送代码到 GitHub（如果还没推送）

```bash
git add .
git commit -m "Add backend deployment config"
git push
```

#### 3. 在 Render 部署

1. 访问 https://render.com
2. 使用 GitHub 账号登录
3. 点击 "New +" -> "Web Service"
4. 连接你的 GitHub 仓库
5. 配置服务：
   - Name: `football-betting-api`
   - Root Directory: `server`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. 选择 Free 套餐
7. 点击 "Create Web Service"

#### 4. 配置环境变量（如果需要）

在 Render 的 Environment 标签页添加所需的环境变量。

部署成功后，你会得到一个 API 地址，类似：
`https://football-betting-api.onrender.com`

### 免费套餐限制

- Render 免费套餐会在 15 分钟无活动后休眠
- 首次访问时可能需要等待 10-30 秒唤醒

---

## 替代方案：其他免费部署平台

### Railway（后端）

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 部署
cd server
railway init
railway up
```

### PythonAnywhere（后端）

1. 注册 https://www.pythonanywhere.com
2. 创建 Web app
3. 上传代码或从 GitHub 拉取
4. 配置 WSGI 文件
5. 重启应用

---

## 环境变量配置

### H5 版本需要配置 API 地址

**修改前端 API 配置文件 `src/utils/http.js`：**

```javascript
const BASE_URL = process.env.NODE_ENV === "production" ? "https://你的后端API地址.onrender.com" : "http://localhost:7001";
```

### 在 Vercel 中配置环境变量

1. 进入 Vercel 项目设置
2. Environment Variables
3. 添加：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://你的后端API地址.onrender.com`

---

## 完整部署清单

- [ ] 后端部署到 Render 并获取 API 地址
- [ ] 更新前端 API 配置
- [ ] 构建 H5 版本 `npm run build:h5`
- [ ] H5 部署到 Vercel
- [ ] 配置微信小程序 AppID
- [ ] 构建小程序版本 `npm run build:mp-weixin`
- [ ] 使用微信开发者工具上传
- [ ] 提交小程序审核

---

## 注意事项

### 1. HTTPS 要求

- 微信小程序要求 API 必须使用 HTTPS
- Render/Vercel 自动提供 HTTPS

### 2. 域名白名单

在微信小程序后台配置服务器域名白名单：

- 开发管理 -> 开发设置 -> 服务器域名
- 添加你的后端 API 域名

### 3. 跨域问题

确保后端配置 CORS：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. 数据库

- 免费部署的数据会在重启后丢失
- 建议使用免费数据库服务：
  - Supabase（PostgreSQL）
  - MongoDB Atlas（免费 512MB）
  - PlanetScale（MySQL）

---

## 成本估算

| 项目         | 平台         | 费用                        |
| ------------ | ------------ | --------------------------- |
| H5 网站      | Vercel       | ✅ 完全免费                 |
| 后端 API     | Render       | ✅ 完全免费（有限制）       |
| 微信小程序   | 微信公众平台 | ✅ 个人免费/企业 300 元认证 |
| 域名（可选） | 各域名商     | 约 50 元/年                 |
| **总计**     |              | **0-350 元/年**             |

---

## 技术支持

如遇到部署问题，可以：

1. 查看各平台的官方文档
2. 检查构建日志
3. 确认环境变量配置正确
