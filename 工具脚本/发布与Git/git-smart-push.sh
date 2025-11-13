#!/bin/bash
# Git 智能推送脚本 - 自动处理网络环境切换
# 使用方法: ./git-smart-push.sh [分支名，默认当前分支]

PROXY_HOST="127.0.0.1:10808"
BRANCH=${1:-$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")}

echo "========================================="
echo "🚀 Git 智能推送脚本"
echo "========================================="
echo "目标分支: origin/$BRANCH"
echo ""

# 尝试1: 直连推送
echo "📡 [尝试1] 直连推送..."
if git push origin "$BRANCH" 2>&1; then
    echo ""
    echo "✅ 直连推送成功！"
    exit 0
fi

echo ""
echo "⚠️  直连失败，可能需要代理"
echo ""

# 尝试2: 使用代理推送
echo "📡 [尝试2] 使用代理推送 ($PROXY_HOST)..."
git config --global http.proxy "http://$PROXY_HOST"
git config --global https.proxy "http://$PROXY_HOST"

if git push origin "$BRANCH" 2>&1; then
    echo ""
    echo "✅ 代理推送成功！"
    # 清理代理配置
    git config --global --unset http.proxy
    git config --global --unset https.proxy
    echo "🧹 已清理代理配置"
    exit 0
else
    echo ""
    echo "❌ 代理推送也失败"
    # 清理代理配置
    git config --global --unset http.proxy
    git config --global --unset https.proxy
    echo "🧹 已清理代理配置"
    echo ""
    echo "💡 建议："
    echo "   1. 检查网络连接"
    echo "   2. 确认代理是否运行: $PROXY_HOST"
    echo "   3. 尝试手动推送: git push origin $BRANCH"
    exit 1
fi
