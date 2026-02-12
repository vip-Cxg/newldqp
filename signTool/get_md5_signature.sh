#!/bin/bash

# 获取Android签名MD5值的脚本
# 用途：从现有keystore文件中提取MD5签名值

echo "=== Android签名MD5值获取工具 ==="
echo ""

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <keystore_file> <alias> [storepass]"
    echo ""
    echo "示例:"
    echo "  $0 myapp.keystore myapp"
    echo "  $0 myapp.keystore myapp myapp123456"
    echo ""
    echo "如果不提供密码，将使用 alias+123456 作为密码"
    exit 1
fi

KEYSTORE_FILE=$1
ALIAS=$2
STORE_PASS=${3:-"${ALIAS}123456"}

# 检查keystore文件是否存在
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "❌ 错误: 文件 $KEYSTORE_FILE 不存在!"
    exit 1
fi

echo "配置信息:"
echo "  签名文件: $KEYSTORE_FILE"
echo "  Alias: $ALIAS"
echo "  密码: $STORE_PASS"
echo ""

echo "=== 获取MD5签名值 ==="
echo ""

# 方法1: 使用keytool -exportcert + openssl
echo "方法1 - 使用 keytool -exportcert + openssl:"
MD5_VALUE=$(keytool -exportcert -alias "$ALIAS" -keystore "$KEYSTORE_FILE" -storepass "$STORE_PASS" 2>/dev/null | openssl dgst -md5 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$MD5_VALUE" ]; then
    echo "✅ MD5签名值: $MD5_VALUE"
    echo ""
    echo "📋 用于微信开放平台的MD5值（去掉冒号）:"
    echo "${MD5_VALUE#*= }" | tr -d ':'
    echo ""
else
    echo "❌ 获取失败，请检查alias和密码是否正确"
    echo ""
fi

# 方法2: 使用keytool -list -v
echo "方法2 - 使用 keytool -list -v:"
keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STORE_PASS" 2>/dev/null | grep -i "md5"

if [ $? -ne 0 ]; then
    echo "❌ 获取失败，请检查alias和密码是否正确"
fi

echo ""
echo "=== 使用说明 ==="
echo "1. 复制上面的MD5值到微信开放平台"
echo "2. 微信开放平台需要的是去掉冒号的MD5值"
echo "3. 确保包名和MD5值都正确匹配"
