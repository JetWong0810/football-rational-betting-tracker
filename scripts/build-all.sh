#!/bin/bash

# 构建所有平台脚本
echo "🏗️  开始构建所有平台..."

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建H5
echo ""
echo "🌐 构建H5版本..."
npm run build:h5
if [ $? -eq 0 ]; then
    echo "✅ H5构建成功！输出目录: dist/build/h5"
else
    echo "❌ H5构建失败"
    exit 1
fi

# 构建微信小程序
echo ""
echo "📱 构建微信小程序版本..."
npm run build:mp-weixin
if [ $? -eq 0 ]; then
    echo "✅ 微信小程序构建成功！输出目录: dist/build/mp-weixin"
else
    echo "❌ 微信小程序构建失败"
    exit 1
fi

echo ""
echo "🎉 所有平台构建完成！"
echo ""
echo "📂 构建产物："
echo "  - H5: dist/build/h5"
echo "  - 微信小程序: dist/build/mp-weixin"
echo ""
echo "📝 下一步："
echo "  1. H5: 推送代码到GitHub，在Vercel部署"
echo "  2. 微信小程序: 使用微信开发者工具打开 dist/build/mp-weixin 目录并上传"

