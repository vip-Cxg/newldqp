#!/bin/bash

# Android签名生成脚本
# 用途：根据输入的alias生成keystore文件
# 密码规则：alias + "123456"

echo "=== Android签名生成工具 ==="
echo ""

# 检查是否输入了alias
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <alias>"
    echo "示例: $0 myapp"
    echo ""
    echo "脚本将生成: myapp.keystore"
    echo "密码将是: myapp123456"
    exit 1
fi

ALIAS=$1
KEYSTORE_NAME="${ALIAS}.keystore"
PASSWORD="${ALIAS}123456"

echo "配置信息:"
echo "  Alias: $ALIAS"
echo "  签名文件: $KEYSTORE_NAME"
echo "  密码: $PASSWORD"
echo ""

# 检查是否已存在同名keystore文件
if [ -f "$KEYSTORE_NAME" ]; then
    echo "警告: 文件 $KEYSTORE_NAME 已存在!"
    read -p "是否覆盖? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 1
    fi
    rm "$KEYSTORE_NAME"
fi

echo "正在生成签名文件..."
echo ""

# 生成keystore文件
keytool -genkey -v \
    -keystore "$KEYSTORE_NAME" \
    -alias "$ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$PASSWORD" \
    -keypass "$PASSWORD" \
    -dname "CN=$ALIAS, OU=$ALIAS, O=$ALIAS, L=Beijing, ST=Beijing, C=CN"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 签名文件生成成功!"
    echo "📁 文件位置: $(pwd)/$KEYSTORE_NAME"
    echo "🔑 Alias: $ALIAS"
    echo "🔐 密码: $PASSWORD"
    echo ""
    echo "=== 签名信息 ==="
    keytool -list -v -keystore "$KEYSTORE_NAME" -alias "$ALIAS" -storepass "$PASSWORD"
    echo ""
    echo "=== 使用说明 ==="
    echo "1. 将以下配置添加到 gradle.properties:"
    echo "   RELEASE_STORE_FILE=$(pwd)/$KEYSTORE_NAME"
    echo "   RELEASE_STORE_PASSWORD=$PASSWORD"
    echo "   RELEASE_KEY_ALIAS=$ALIAS"
    echo "   RELEASE_KEY_PASSWORD=$PASSWORD"
    echo ""
    echo "2. 获取MD5签名用于微信开放平台:"
    echo "   keytool -exportcert -alias $ALIAS -keystore $KEYSTORE_NAME -storepass $PASSWORD | openssl dgst -md5"
    echo ""
    echo "=== 当前签名的MD5值 ==="
    keytool -exportcert -alias "$ALIAS" -keystore "$KEYSTORE_NAME" -storepass "$PASSWORD" | openssl dgst -md5
else
    echo ""
    echo "❌ 签名文件生成失败!"
    exit 1
fi
