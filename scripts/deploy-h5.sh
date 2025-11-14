#!/bin/bash

# H5部署脚本（使用Vercel CLI）
echo "🚀 开始部署H5到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "⚠️  未检测到Vercel CLI，正在安装..."
    npm install -g vercel
fi

# 构建H5
echo "🏗️  构建H5版本..."
npm run build:h5

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 部署到Vercel
echo "📤 部署到Vercel..."
cd dist/build/h5
vercel --prod

echo "✅ 部署完成！"

