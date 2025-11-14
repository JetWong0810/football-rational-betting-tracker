# 🎯 部署配置文件说明

本项目已为你准备好所有部署所需的配置文件和脚本！

---

## 📁 已创建的部署文件

### 📄 文档文件

1. **`QUICK_DEPLOY.md`** ⭐️ 推荐先看
   - 15分钟快速部署指南
   - 适合快速上手
   - 包含分步操作流程

2. **`DEPLOYMENT.md`**
   - 完整详细的部署文档
   - 包含多种部署方案
   - 技术细节和故障排查

3. **`README.md`**
   - 已更新，添加了部署章节
   - 快速链接到部署文档

### ⚙️ 配置文件

4. **`vercel.json`**
   - Vercel H5部署配置
   - 自动化构建和路由配置
   - 已配置好缓存策略

5. **`server/render.yaml`**
   - Render后端部署配置
   - Python环境和启动命令
   - 健康检查配置

6. **`server/Procfile`**
   - 进程启动配置
   - 适用于Heroku等平台

7. **`.gitignore`**
   - Git忽略文件配置
   - 保护敏感信息

### 🔧 代码更新

8. **`src/utils/http.js`** (已更新)
   - 添加了环境变量支持
   - 自动根据平台选择API地址
   - 需要修改第10行为你的实际API地址

### 🚀 部署脚本

9. **`scripts/build-all.sh`**
   - 一键构建所有平台
   - 自动检查依赖
   - 显示构建结果

10. **`scripts/deploy-h5.sh`**
    - 一键部署H5到Vercel
    - 使用Vercel CLI
    - 自动构建并发布

11. **`scripts/check-deploy-config.sh`**
    - 部署前配置检查
    - 验证必要配置项
    - 给出修改建议

---

## 🚀 快速开始（3步）

### 第1步：检查配置

运行配置检查脚本：

```bash
cd /Users/jetwong/Projects/uniapp/football-rational-betting-tracker
./scripts/check-deploy-config.sh
```

根据提示修复配置问题。

### 第2步：阅读快速部署指南

```bash
# 在编辑器中打开
open QUICK_DEPLOY.md

# 或在终端查看
cat QUICK_DEPLOY.md
```

### 第3步：开始部署

按照 `QUICK_DEPLOY.md` 中的步骤进行部署：
1. 部署后端到Render（5-10分钟）
2. 部署H5到Vercel（3-5分钟）
3. 部署微信小程序（5-10分钟）

---

## 📝 需要手动配置的项目

### ⚠️ 必须修改（部署前）

1. **后端API地址**
   - 文件：`src/utils/http.js`
   - 位置：第10行
   - 改为：你的实际后端API地址（从Render获取）
   ```javascript
   return 'https://你的后端API地址.onrender.com'
   ```

2. **微信小程序AppID**（如果部署小程序）
   - 文件：`src/manifest.json`
   - 位置：第48行
   - 改为：你的微信小程序AppID
   ```json
   "appid": "wx1234567890abcdef"
   ```

### ⚙️ 可选配置

3. **环境变量（H5部署）**
   - 在Vercel部署页面配置
   - 变量名：`VITE_API_BASE_URL`
   - 变量值：你的后端API地址

---

## 🎯 部署平台选择

### 后端（选一个）

| 平台 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Render** | 免费，配置简单，自动HTTPS | 15分钟不活动会休眠 | ⭐️⭐️⭐️⭐️⭐️ |
| Railway | 界面友好，CI/CD好 | 免费额度有限 | ⭐️⭐️⭐️⭐️ |
| Fly.io | 性能好，全球部署 | 配置稍复杂 | ⭐️⭐️⭐️ |
| PythonAnywhere | 稳定，适合Python | 需要手动配置 | ⭐️⭐️⭐️ |

### 前端H5（选一个）

| 平台 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Vercel** | 极快，自动部署，免费 | 国内访问可能较慢 | ⭐️⭐️⭐️⭐️⭐️ |
| Netlify | 功能丰富，易用 | 构建时间限制 | ⭐️⭐️⭐️⭐️ |
| Cloudflare Pages | 国内访问快 | 配置稍复杂 | ⭐️⭐️⭐️⭐️ |
| GitHub Pages | 简单，免费 | 功能有限 | ⭐️⭐️⭐️ |

---

## 📋 部署流程图

```
开始部署
    ↓
运行 check-deploy-config.sh
    ↓
修复配置问题
    ↓
推送代码到GitHub
    ↓
部署后端（Render）
    ↓
获取后端API地址
    ↓
更新 src/utils/http.js
    ↓
提交并推送代码
    ↓
部署H5（Vercel）
    ↓
测试H5功能
    ↓
配置微信小程序AppID
    ↓
构建小程序：npm run build:mp-weixin
    ↓
上传到微信开发者工具
    ↓
提交审核
    ↓
部署完成！🎉
```

---

## 🔧 常用命令

```bash
# 检查部署配置
./scripts/check-deploy-config.sh

# 构建所有平台
./scripts/build-all.sh

# 构建H5
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 一键部署H5（需要先安装Vercel CLI）
./scripts/deploy-h5.sh

# 启动本地开发服务器
npm run dev:h5                    # H5
npm run dev:mp-weixin             # 微信小程序
npm run server:dev                # 后端API
```

---

## 📚 文档阅读顺序

1. 🎯 **先看**: `QUICK_DEPLOY.md` - 快速上手
2. 🔍 **再看**: `DEPLOYMENT.md` - 了解详细技术
3. 💡 **遇到问题**: 查看 `DEPLOYMENT.md` 的"常见问题"章节

---

## ✅ 部署检查清单

复制以下清单，逐项完成：

```
部署前准备：
□ 运行 check-deploy-config.sh 并修复所有问题
□ 代码已推送到GitHub
□ 已注册GitHub账号

后端部署：
□ 在Render注册并登录
□ 创建Web Service并连接仓库
□ 配置构建命令和启动命令
□ 等待部署完成
□ 复制API地址
□ 测试API健康检查 /api/health

前端配置：
□ 更新 src/utils/http.js 中的API地址
□ 提交并推送代码

H5部署：
□ 在Vercel注册并登录
□ 导入项目并配置构建设置
□ 部署成功
□ 访问H5网站并测试功能

微信小程序（可选）：
□ 注册微信小程序账号
□ 获取AppID
□ 配置服务器域名白名单
□ 更新 manifest.json 中的AppID
□ 构建小程序版本
□ 下载微信开发者工具
□ 导入并上传代码
□ 提交审核
□ 等待审核通过并发布
```

---

## 💰 费用估算

| 项目 | 平台 | 月费用 | 年费用 |
|------|------|--------|--------|
| H5托管 | Vercel | ¥0 | ¥0 |
| 后端API | Render | ¥0 | ¥0 |
| 微信小程序 | 微信 | ¥0 | ¥0 (个人) / ¥300 (企业认证) |
| 域名（可选） | 各域名商 | - | ¥50-100 |
| **总计** | | **¥0/月** | **¥0-400/年** |

**结论：完全可以零成本部署！** ✅

---

## 🆘 获取帮助

如果遇到问题：

1. **查看日志**
   - Vercel: 项目设置 -> Deployments -> 点击具体部署 -> Build Logs
   - Render: 项目页面 -> Logs 标签

2. **检查配置**
   - 运行 `./scripts/check-deploy-config.sh`
   - 对照 `DEPLOYMENT.md` 中的配置说明

3. **常见问题**
   - API调用失败 → 检查CORS配置和域名白名单
   - 构建失败 → 查看构建日志，检查依赖
   - 小程序审核不通过 → 查看审核意见，调整后重新提交

4. **参考文档**
   - [Vercel文档](https://vercel.com/docs)
   - [Render文档](https://render.com/docs)
   - [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 🎉 部署成功后

完成部署后，你将拥有：

- ✅ 一个公网可访问的H5网站
- ✅ 一个在线的后端API服务
- ✅ （可选）一个已发布的微信小程序

**恭喜你！现在可以开始使用你的足彩理性投资助手了！** 🎊

---

**下一步建议：**
- 分享H5链接给朋友试用
- 在微信小程序商店搜索你的小程序
- 持续优化和添加新功能
- 考虑添加数据库实现数据持久化

---

💡 提示：记得将你的部署地址添加到项目README中，方便以后查看！

