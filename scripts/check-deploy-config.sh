#!/bin/bash

echo "🔍 检查部署配置..."
echo ""

errors=0
warnings=0

# 检查manifest.json中的微信小程序AppID
echo "📱 检查微信小程序配置..."
if grep -q '"appid": ""' src/manifest.json; then
    echo "⚠️  警告: manifest.json 中的微信小程序 appid 为空"
    echo "   请编辑 src/manifest.json 第48行，填入你的微信小程序AppID"
    warnings=$((warnings + 1))
else
    echo "✅ 微信小程序 AppID 已配置"
fi
echo ""

# 检查API地址配置
echo "🌐 检查API地址配置..."
if grep -q '你的后端API地址.onrender.com' src/utils/http.js; then
    echo "⚠️  警告: http.js 中的API地址还未更新"
    echo "   请编辑 src/utils/http.js 第10行，替换为你的实际后端API地址"
    warnings=$((warnings + 1))
else
    echo "✅ API地址已配置"
fi
echo ""

# 检查node_modules
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "❌ 错误: node_modules 不存在，请先运行 npm install"
    errors=$((errors + 1))
else
    echo "✅ 依赖已安装"
fi
echo ""

# 检查后端依赖
echo "🐍 检查后端依赖..."
if [ ! -f "server/requirements.txt" ]; then
    echo "❌ 错误: server/requirements.txt 不存在"
    errors=$((errors + 1))
else
    echo "✅ 后端依赖配置文件存在"
fi
echo ""

# 检查git仓库
echo "📝 检查Git配置..."
if [ ! -d ".git" ]; then
    echo "⚠️  警告: 未初始化Git仓库"
    echo "   运行: git init && git add . && git commit -m 'Initial commit'"
    warnings=$((warnings + 1))
else
    echo "✅ Git仓库已初始化"
    
    # 检查是否有远程仓库
    if ! git remote | grep -q 'origin'; then
        echo "⚠️  警告: 未配置远程仓库"
        echo "   运行: git remote add origin <你的GitHub仓库地址>"
        warnings=$((warnings + 1))
    else
        echo "✅ 远程仓库已配置: $(git remote get-url origin)"
    fi
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 配置检查结果："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ 错误: $errors"
echo "⚠️  警告: $warnings"
echo ""

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo "🎉 所有配置检查通过！可以开始部署了！"
    echo ""
    echo "📋 下一步："
    echo "  1. 推送代码到GitHub: git push"
    echo "  2. 部署后端到Render: https://render.com"
    echo "  3. 部署H5到Vercel: https://vercel.com"
    echo "  4. 构建并上传微信小程序: npm run build:mp-weixin"
elif [ $errors -eq 0 ]; then
    echo "⚠️  有 $warnings 个警告，但可以继续部署"
    echo "   建议先处理警告项，以确保部署顺利"
else
    echo "❌ 有 $errors 个错误需要修复才能部署"
fi
echo ""

