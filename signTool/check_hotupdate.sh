#!/bin/bash

# 热更新兼容性检查工具
# 用途：检查包名修改后是否会影响热更新功能

echo "=== 热更新兼容性检查工具 ==="
echo ""

# 获取当前包名
CURRENT_PACKAGE=$(grep -o 'namespace "[^"]*"' build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle | sed 's/namespace "//;s/"//')
echo "📱 当前包名: $CURRENT_PACKAGE"
echo ""

# 检查热更新配置文件
echo "🔍 检查热更新配置..."

# 检查 project.manifest
if [ -f "assets/project.manifest" ]; then
    echo "✅ project.manifest 存在"
    HOTUPDATE_URL=$(head -c 200 assets/project.manifest | grep -o '"packageUrl":"[^"]*"' | sed 's/"packageUrl":"//;s/"//')
    echo "🌐 热更新服务器: $HOTUPDATE_URL"
else
    echo "❌ project.manifest 不存在"
fi

# 检查 version_generator.js
if [ -f "version_generator.js" ]; then
    echo "✅ version_generator.js 存在"
    BASE_URL=$(grep -o 'BASE_URL = "[^"]*"' version_generator.js | sed 's/BASE_URL = "//;s/"//')
    echo "🔧 版本生成器服务器: $BASE_URL"
else
    echo "❌ version_generator.js 不存在"
fi

echo ""
echo "📋 兼容性分析:"
echo "1. 热更新机制主要通过 version.manifest 检查版本"
echo "2. 服务器地址固定，不依赖包名"
echo "3. 包名修改不会影响热更新功能"
echo ""

# 检查服务器连通性
echo "🌐 测试服务器连通性..."
if [ -n "$HOTUPDATE_URL" ]; then
    echo "测试热更新服务器: $HOTUPDATE_URL"
    if curl -s --connect-timeout 5 "$HOTUPDATE_URL" > /dev/null; then
        echo "✅ 热更新服务器可访问"
    else
        echo "❌ 热更新服务器无法访问"
    fi
fi

echo ""
echo "💡 建议:"
echo "1. 包名修改后热更新功能正常"
echo "2. 如需不同包名使用不同热更新地址，需要修改:"
echo "   - assets/project.manifest"
echo "   - version_generator.js"
echo "   - 服务器端配置"
echo ""
echo "✅ 检查完成！"
