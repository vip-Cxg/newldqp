#!/bin/bash

# Android签名工具启动脚本
# 用途：快速访问signTool文件夹中的签名工具

echo "=== Android签名工具集 ==="
echo ""
echo "📁 工具位置: signTool/"
echo ""

# 检查signTool文件夹是否存在
if [ ! -d "signTool" ]; then
    echo "❌ 错误: signTool文件夹不存在!"
    exit 1
fi

echo "可用工具:"
echo "1. 生成签名文件"
echo "2. 获取MD5签名值"
echo "3. 修改包名"
echo "4. 还原包名"
echo "5. 构建APK"
echo "6. 检查热更新兼容性"
echo "7. 查看使用说明"
echo "8. 退出"
echo ""

read -p "请选择操作 (1-8): " choice

case $choice in
    1)
        echo ""
        read -p "请输入alias名称: " alias
        if [ -n "$alias" ]; then
            echo "正在生成签名文件..."
            cd signTool && ./generate_keystore.sh "$alias"
        else
            echo "❌ 请输入有效的alias名称"
        fi
        ;;
    2)
        echo ""
        read -p "请输入keystore文件名: " keystore
        read -p "请输入alias名称: " alias
        if [ -n "$keystore" ] && [ -n "$alias" ]; then
            echo "正在获取MD5签名值..."
            cd signTool && ./get_md5_signature.sh "$keystore" "$alias"
        else
            echo "❌ 请输入有效的文件名和alias"
        fi
        ;;
    3)
        echo ""
        echo "=== 修改包名 ==="
        read -p "请输入新包名 (如: com.newcompany.newapp): " new_package
        read -p "请输入签名文件名 (可选，直接回车跳过): " keystore_file
        read -p "请输入微信AppID (可选，直接回车跳过): " wx_appid
        if [ -n "$new_package" ]; then
            echo "正在修改包名..."
            if [ -n "$keystore_file" ] && [ -n "$wx_appid" ]; then
                cd signTool && ./change_package.sh "$new_package" "$keystore_file" "$wx_appid"
            elif [ -n "$keystore_file" ]; then
                cd signTool && ./change_package.sh "$new_package" "$keystore_file"
            elif [ -n "$wx_appid" ]; then
                cd signTool && ./change_package.sh "$new_package" "" "$wx_appid"
            else
                cd signTool && ./change_package.sh "$new_package"
            fi
        else
            echo "❌ 请输入有效的包名"
        fi
        ;;
    4)
        echo ""
        echo "=== 还原包名 ==="
        echo "正在还原..."
        cd signTool && ./change_package.sh restore
        ;;
    5)
        echo ""
        echo "=== 构建APK ==="
        echo "选择构建类型:"
        echo "1. 清理并构建Release版本"
        echo "2. 只构建Release版本"
        echo "3. 构建Debug版本"
        echo "4. 返回主菜单"
        read -p "请选择 (1-4): " build_choice
        
        case $build_choice in
            1)
                echo "正在清理并构建Release版本..."
                cd build/jsb-link/frameworks/runtime-src/proj.android-studio && ./gradlew clean assembleRelease
                if [ $? -eq 0 ]; then
                    echo "✅ 构建成功!"
                    echo "📱 APK位置: app/build/outputs/apk/release/"
                    ls -la app/build/outputs/apk/release/*.apk
                else
                    echo "❌ 构建失败!"
                fi
                ;;
            2)
                echo "正在构建Release版本..."
                cd build/jsb-link/frameworks/runtime-src/proj.android-studio && ./gradlew assembleRelease
                if [ $? -eq 0 ]; then
                    echo "✅ 构建成功!"
                    echo "📱 APK位置: app/build/outputs/apk/release/"
                    ls -la app/build/outputs/apk/release/*.apk
                else
                    echo "❌ 构建失败!"
                fi
                ;;
            3)
                echo "正在构建Debug版本..."
                cd build/jsb-link/frameworks/runtime-src/proj.android-studio && ./gradlew assembleDebug
                if [ $? -eq 0 ]; then
                    echo "✅ 构建成功!"
                    echo "📱 APK位置: app/build/outputs/apk/debug/"
                    ls -la app/build/outputs/apk/debug/*.apk
                else
                    echo "❌ 构建失败!"
                fi
                ;;
            4)
                echo "返回主菜单"
                ;;
            *)
                echo "❌ 无效选择"
                ;;
        esac
        ;;
    6)
        echo ""
        echo "=== 检查热更新兼容性 ==="
        ./signTool/check_hotupdate.sh
        ;;
    7)
        echo ""
        echo "=== 使用说明 ==="
        cd signTool && cat README.md
        ;;
    8)
        echo "退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
