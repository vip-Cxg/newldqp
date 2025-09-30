#!/bin/bash

# Android包名修改工具
# 用途：修改Android应用的包名，支持还原

echo "=== Android包名修改工具 ==="
echo ""

# 检查是否在正确的目录
if [ ! -f "../build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle" ]; then
    echo "❌ 错误: 请在项目根目录的signTool文件夹中运行此脚本!"
    exit 1
fi

# 备份文件路径
BACKUP_DIR="../backup_$(date +%Y%m%d_%H%M%S)"
ANDROID_PROJECT="../build/jsb-link/frameworks/runtime-src/proj.android-studio"

echo "配置信息:"
echo "  Android项目路径: $ANDROID_PROJECT"
echo "  备份目录: $BACKUP_DIR"
echo ""

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <new_package_name> [keystore_file] [wx_appid]"
    echo ""
    echo "示例:"
    echo "  $0 com.newcompany.newapp                    # 只修改包名"
    echo "  $0 com.newcompany.newapp myapp.keystore     # 修改包名和签名"
    echo "  $0 com.newcompany.newapp myapp.keystore wx1234567890abcdef  # 修改全部"
    echo ""
    echo "参数说明:"
    echo "  new_package_name: 新的包名，如 com.newcompany.newapp"
    echo "  keystore_file: 签名文件名（可选），如 myapp.keystore"
    echo "  wx_appid: 微信AppID（可选），如 wx1234567890abcdef"
    echo ""
    echo "还原方法:"
    echo "  $0 restore"
    echo ""
    exit 1
fi

# 还原功能
if [ "$1" = "restore" ]; then
    echo "=== 还原包名 ==="
    echo ""
    
    # 查找最新的备份目录
    LATEST_BACKUP=$(ls -td ../backup_* 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo "❌ 没有找到备份文件!"
        exit 1
    fi
    
    echo "找到备份目录: $LATEST_BACKUP"
    echo "正在还原..."
    
    # 还原文件
    cp "$LATEST_BACKUP/build.gradle" "$ANDROID_PROJECT/app/build.gradle"
    cp "$LATEST_BACKUP/AndroidManifest.xml" "$ANDROID_PROJECT/app/AndroidManifest.xml"
    cp "$LATEST_BACKUP/gradle.properties" "$ANDROID_PROJECT/gradle.properties"
    
    # 还原Java文件
    if [ -d "$LATEST_BACKUP/src" ]; then
        rm -rf "$ANDROID_PROJECT/src"
        cp -r "$LATEST_BACKUP/src" "$ANDROID_PROJECT/"
    fi
    
    echo "✅ 还原完成!"
    echo "📁 备份目录: $LATEST_BACKUP"
    
    # 自动删除备份目录
    echo "🗑️  清理备份目录..."
    rm -rf "$LATEST_BACKUP"
    echo "✅ 备份已清理"
    exit 0
fi

# 检查参数数量
if [ $# -lt 1 ] || [ $# -gt 3 ]; then
    echo "❌ 错误: 需要1-3个参数!"
    echo "使用方法: $0 <new_package_name> [keystore_file] [wx_appid]"
    echo ""
    echo "参数说明:"
    echo "  new_package_name: 新的包名，如 com.newcompany.newapp"
    echo "  keystore_file: 签名文件名（可选），如 myapp.keystore"
    echo "                如果不提供，将保持原有的签名配置不变"
    echo "  wx_appid: 微信AppID（可选），如 wx1234567890abcdef"
    echo "            如果不提供，将保持原有的微信AppID不变"
    exit 1
fi

NEW_PACKAGE=$1
KEYSTORE_FILE=$2
WX_APPID=$3

# 验证包名格式
if [[ ! $NEW_PACKAGE =~ ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$ ]]; then
    echo "❌ 错误: 包名格式不正确!"
    echo "正确格式: com.company.app (小写字母开头，包含点号)"
    exit 1
fi

# 检查签名文件是否存在（如果提供了的话）
if [ -n "$KEYSTORE_FILE" ] && [ ! -f "$KEYSTORE_FILE" ]; then
    echo "❌ 错误: 签名文件 $KEYSTORE_FILE 不存在!"
    echo "请确保签名文件在signTool目录中"
    exit 1
fi

# 验证微信AppID格式（如果提供了的话）
if [ -n "$WX_APPID" ] && [[ ! $WX_APPID =~ ^wx[0-9a-fA-F]{16}$ ]]; then
    echo "❌ 错误: 微信AppID格式不正确!"
    echo "正确格式: wx + 16位十六进制字符，如 wx1234567890abcdef"
    exit 1
fi

echo "修改配置:"
echo "  新包名: $NEW_PACKAGE"
if [ -n "$KEYSTORE_FILE" ]; then
    echo "  签名文件: $KEYSTORE_FILE"
else
    echo "  签名文件: 保持不变"
fi
if [ -n "$WX_APPID" ]; then
    echo "  微信AppID: $WX_APPID"
else
    echo "  微信AppID: 保持不变"
fi
echo ""

read -p "确认修改? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 1
fi

echo "正在创建备份..."
mkdir -p "$BACKUP_DIR"

# 备份关键文件
cp "$ANDROID_PROJECT/app/build.gradle" "$BACKUP_DIR/"
cp "$ANDROID_PROJECT/app/AndroidManifest.xml" "$BACKUP_DIR/"
cp "$ANDROID_PROJECT/gradle.properties" "$BACKUP_DIR/"

# 备份Java源代码
if [ -d "$ANDROID_PROJECT/src" ]; then
    cp -r "$ANDROID_PROJECT/src" "$BACKUP_DIR/"
fi

echo "✅ 备份完成: $BACKUP_DIR"
echo ""

echo "正在修改包名..."

# 1. 修改 build.gradle
echo "1. 修改 app/build.gradle..."
sed -i.bak "s/namespace \"[^\"]*\"/namespace \"$NEW_PACKAGE\"/" "$ANDROID_PROJECT/app/build.gradle"

# 2. 修改 AndroidManifest.xml
echo "2. 修改 app/AndroidManifest.xml..."
sed -i.bak "s/package=\"[^\"]*\"/package=\"$NEW_PACKAGE\"/" "$ANDROID_PROJECT/app/AndroidManifest.xml"

# 3. 创建新的Java包目录结构
echo "3. 创建新的Java包目录结构..."
NEW_PACKAGE_DIR=$(echo "$NEW_PACKAGE" | tr '.' '/')
mkdir -p "$ANDROID_PROJECT/src/$NEW_PACKAGE_DIR/wxapi"

# 4. 移动并修改Java文件
echo "4. 移动并修改Java文件..."

# 移动WXEntryActivity.java
if [ -f "$ANDROID_PROJECT/src/com/ldplay/game/wxapi/WXEntryActivity.java" ]; then
    # 先复制文件
    cp "$ANDROID_PROJECT/src/com/ldplay/game/wxapi/WXEntryActivity.java" "$ANDROID_PROJECT/src/$NEW_PACKAGE_DIR/wxapi/"
    
    # 检查复制是否成功
    if [ -f "$ANDROID_PROJECT/src/$NEW_PACKAGE_DIR/wxapi/WXEntryActivity.java" ]; then
        # 修改WXEntryActivity.java中的包名
        sed -i.bak "s/package com\.ldplay\.game\.wxapi;/package $NEW_PACKAGE.wxapi;/" "$ANDROID_PROJECT/src/$NEW_PACKAGE_DIR/wxapi/WXEntryActivity.java"
        
        echo "  ✅ 文件复制和修改成功"
        echo "  📁 新文件位置: $ANDROID_PROJECT/src/$NEW_PACKAGE_DIR/wxapi/WXEntryActivity.java"
        
        # 直接删除旧文件（已有备份保护）
        echo "  🗑️  删除旧包目录: $ANDROID_PROJECT/src/com/ldplay"
        rm -rf "$ANDROID_PROJECT/src/com/ldplay"
        echo "  ✅ 旧ldplay目录已删除"
        echo "  📁 保留新包目录: $ANDROID_PROJECT/src/$NEW_PACKAGE_DIR"
    else
        echo "  ❌ 文件复制失败，保留原文件"
        exit 1
    fi
else
    echo "  ⚠️  未找到WXEntryActivity.java文件，跳过Java文件处理"
fi

# 5. 修改AndroidManifest.xml中的Activity引用
echo "5. 修改AndroidManifest.xml中的Activity引用..."
sed -i.bak "s/com\.ldplay\.game\.wxapi\.WXEntryActivity/$NEW_PACKAGE.wxapi.WXEntryActivity/" "$ANDROID_PROJECT/app/AndroidManifest.xml"
sed -i.bak "s/android:taskAffinity=\"com\.ldplay\.game\"/android:taskAffinity=\"$NEW_PACKAGE\"/" "$ANDROID_PROJECT/app/AndroidManifest.xml"

# 6. 更新签名配置（如果提供了keystore文件）
if [ -n "$KEYSTORE_FILE" ]; then
    echo "6. 更新签名配置..."
    KEYSTORE_PATH="../../../../../signTool/$KEYSTORE_FILE"
    KEYSTORE_ALIAS=$(basename "$KEYSTORE_FILE" .keystore)
    KEYSTORE_PASSWORD="${KEYSTORE_ALIAS}123456"

    # 更新gradle.properties
    GRADLE_PROPERTIES="$ANDROID_PROJECT/gradle.properties"
    sed -i.bak "s|RELEASE_STORE_FILE=.*|RELEASE_STORE_FILE=$KEYSTORE_PATH|" "$GRADLE_PROPERTIES"
    sed -i.bak "s/RELEASE_STORE_PASSWORD=.*/RELEASE_STORE_PASSWORD=$KEYSTORE_PASSWORD/" "$GRADLE_PROPERTIES"
    sed -i.bak "s/RELEASE_KEY_ALIAS=.*/RELEASE_KEY_ALIAS=$KEYSTORE_ALIAS/" "$GRADLE_PROPERTIES"
    sed -i.bak "s/RELEASE_KEY_PASSWORD=.*/RELEASE_KEY_PASSWORD=$KEYSTORE_PASSWORD/" "$GRADLE_PROPERTIES"
else
    echo "6. 保持原有签名配置不变..."
fi

# 7. 更新微信AppID（如果提供了的话）
if [ -n "$WX_APPID" ]; then
    echo "7. 更新微信AppID..."
    sed -i.bak "s/wx_appid = \"[^\"]*\"/wx_appid = \"$WX_APPID\"/" "$ANDROID_PROJECT/src/org/cocos2dx/javascript/AppActivity.java"
else
    echo "7. 保持原有微信AppID不变..."
fi

# 清理备份文件
find "$ANDROID_PROJECT" -name "*.bak" -delete

echo ""
echo "✅ 包名修改完成!"
echo ""
echo "=== 修改摘要 ==="
echo "  新包名: $NEW_PACKAGE"
if [ -n "$KEYSTORE_FILE" ]; then
    echo "  签名文件: $KEYSTORE_PATH"
else
    echo "  签名文件: 保持不变"
fi
if [ -n "$WX_APPID" ]; then
    echo "  微信AppID: $WX_APPID"
else
    echo "  微信AppID: 保持不变"
fi
echo "  备份目录: $BACKUP_DIR"
echo ""
echo "=== 后续步骤 ==="
echo "1. 清理构建缓存:"
echo "   cd $ANDROID_PROJECT && ./gradlew clean"
echo ""
echo "2. 重新构建项目:"
echo "   cd $ANDROID_PROJECT && ./gradlew assembleRelease"
echo ""
echo "3. 如需还原:"
echo "   $0 restore"
echo ""
echo "4. 在微信开放平台配置:"
echo "   包名: $NEW_PACKAGE"
echo "   MD5签名: $(./get_md5_signature.sh "$KEYSTORE_FILE" "$KEYSTORE_ALIAS" | grep "用于微信开放平台" | cut -d: -f2 | tr -d ' ')"
