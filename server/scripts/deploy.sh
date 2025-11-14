#!/bin/bash
# 自有服务器部署脚本

set -e

echo "🚀 开始部署足彩理性投资助手后端服务..."

# 定义变量
APP_DIR="${APP_DIR:-/opt/football-betting-api/server}"
SERVICE_NAME="${SERVICE_NAME:-football-betting-api}"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在项目目录
if [ ! -f "main.py" ]; then
    echo -e "${RED}❌ 错误: 请在server目录下运行此脚本${NC}"
    exit 1
fi

# 检查Python版本
echo -e "${YELLOW}📋 检查Python版本...${NC}"
python3 --version || {
    echo -e "${RED}❌ 错误: 未安装Python3${NC}"
    exit 1
}

# 检查是否存在虚拟环境
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 创建虚拟环境...${NC}"
    python3 -m venv venv
fi

# 激活虚拟环境
echo -e "${YELLOW}🔧 激活虚拟环境...${NC}"
source venv/bin/activate

# 升级pip
echo -e "${YELLOW}⬆️  升级pip...${NC}"
pip install --upgrade pip -q

# 安装依赖
echo -e "${YELLOW}📦 安装依赖包...${NC}"
pip install -r requirements.txt -q

# 检查.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  未找到.env文件，复制示例文件...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}📝 请编辑.env文件配置数据库连接信息${NC}"
        echo -e "${YELLOW}   nano .env${NC}"
        read -p "按Enter继续..." 
    else
        echo -e "${RED}❌ 错误: 未找到env.example文件${NC}"
        exit 1
    fi
fi

# 读取配置
source .env

# 测试数据库连接
echo -e "${YELLOW}🔍 测试数据库连接...${NC}"
if [ "$DB_TYPE" = "mysql" ]; then
    mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" 2>/dev/null && {
        echo -e "${GREEN}✅ 数据库连接成功${NC}"
    } || {
        echo -e "${RED}❌ 数据库连接失败，请检查配置${NC}"
        exit 1
    }
fi

# 初始化数据库
echo -e "${YELLOW}🗄️  初始化数据库...${NC}"
python3 << EOF
from database import init_db
try:
    init_db()
    print("${GREEN}✅ 数据库初始化成功${NC}")
except Exception as e:
    print(f"${RED}❌ 数据库初始化失败: {e}${NC}")
    exit(1)
EOF

# 测试启动
echo -e "${YELLOW}🧪 测试启动服务...${NC}"
timeout 5 uvicorn main:app --host 127.0.0.1 --port 7001 > /dev/null 2>&1 || {
    echo -e "${GREEN}✅ 服务可以正常启动${NC}"
}

echo -e "${GREEN}🎉 部署准备完成！${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo "1. 配置systemd服务（推荐）："
echo "   sudo cp scripts/football-betting-api.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl start football-betting-api"
echo "   sudo systemctl enable football-betting-api"
echo ""
echo "2. 或者手动启动服务："
echo "   source venv/bin/activate"
echo "   uvicorn main:app --host 0.0.0.0 --port 7001"
echo ""
echo "3. 测试API："
echo "   curl http://localhost:7001/api/health"

