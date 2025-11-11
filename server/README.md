# 本地爬虫 & API 服务

该目录集成了竞彩数据抓取、SQLite 存储与 FastAPI 接口，供 `football-rational-betting-tracker` 前端项目本地联调。

## 功能

- 调用中国竞彩网公开 API，覆盖胜平负/让球胜平负、比分、总进球数、半全场五类玩法
- 每 10 分钟自动抓取一次，写入 `server/data/football_odds.sqlite`
- 通过 FastAPI 暴露 `/api/matches`、`/api/matches/{id}`、`/api/matches/{id}/plays` 等接口
- 提供 `/api/sync` 手动触发同步、`/api/health` 查看最新更新时间

## 快速开始

```bash
cd server
python -m venv .venv
source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server.main:app --reload --port 7001
```

首次启动会自动初始化 SQLite 并立即抓取一次，随后每 10 分钟自动刷新。若需要手动刷新，可调用 `POST http://127.0.0.1:7001/api/sync`。

## 目录结构

```
server/
├── data/                    # SQLite 存储位置
├── schema.sql               # 数据表结构
├── settings.py              # 基础配置
├── database.py              # SQLite 初始化 & 工具
├── repository.py            # 数据读写封装
├── scraper/
│   └── sporttery_service.py # 抓取 & 解析逻辑
├── tasks.py                 # 定时任务（APScheduler）
└── main.py                  # FastAPI 入口
```

## 接口示例

- `GET /api/matches?page=1&page_size=20`：分页返回赛事列表及胜平负/让球胜平负赔率
- `GET /api/matches/{matchId}`：获取单场基础信息
- `GET /api/matches/{matchId}/plays`：返回五大玩法的完整赔率

前端可通过 `vite.config.js` 或 UniApp devServer 代理，将 `/api` 路径转发至 `http://127.0.0.1:7001` 实现同源访问。
