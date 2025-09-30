#!/bin/bash

# 热更新目录修改工具
# 用途：将 xhupdate 目录名改为 ldupdate

echo "=== 热更新目录修改工具 ==="
echo ""

# 检查参数
if [ $# -ne 1 ]; then
    echo "使用方法: $0 <新目录名>"
    echo "示例: $0 ldupdate"
    exit 1
fi

NEW_DIR=$1
OLD_DIR="xhupdate"

echo "🔄 正在将 '$OLD_DIR' 替换为 '$NEW_DIR'"
echo ""

# 备份原始文件
echo "📁 创建备份..."
mkdir -p backup_$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"

# 需要修改的文件列表
FILES_TO_MODIFY=(
    "assets/project.manifest"
    "version_generator.js"
    "assets/resources/Main/debug.json"
    "assets/resources/Main/release.json"
    "assets/GameBase/GameConfig.js"
    "assets/Main/Script/SelectLink.js"
    "assets/Main/Script/utils.js"
    "version_generator1.js"
)

# 备份文件
for file in "${FILES_TO_MODIFY[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        echo "✅ 已备份: $file"
    fi
done

echo ""
echo "🔧 开始替换..."

# 替换各个文件中的目录名
for file in "${FILES_TO_MODIFY[@]}"; do
    if [ -f "$file" ]; then
        echo "处理: $file"
        
        # 替换 xhupdate 为新的目录名
        sed -i.bak "s|/$OLD_DIR/|/$NEW_DIR/|g" "$file"
        
        # 替换包含 xhupdate 的完整URL
        sed -i.bak "s|$OLD_DIR/|$NEW_DIR/|g" "$file"
        
        # 替换 newupdate 为新的目录名
        sed -i.bak "s|/newupdate/|/$NEW_DIR/|g" "$file"
        
        # 替换 newconfig 为 ldconfig
        sed -i.bak "s|/newconfig/|/ldconfig/|g" "$file"
        
        # 替换 xhconfig 为 ldconfig
        sed -i.bak "s|/xhconfig/|/ldconfig/|g" "$file"
        
        # 清理临时文件
        rm -f "$file.bak"
        
        echo "✅ 已更新: $file"
    else
        echo "⚠️  文件不存在: $file"
    fi
done

# 跳过media目录下的JSON文件（不需要修改）
echo ""
echo "🎵 媒体文件不需要修改，跳过处理..."

echo ""
echo "📋 修改摘要:"
echo "旧目录名: $OLD_DIR"
echo "新目录名: $NEW_DIR"
echo "备份位置: $BACKUP_DIR"
echo ""

echo "🔍 验证修改结果..."
echo ""

# 验证修改结果
echo "检查主要文件中的目录名:"
grep -n "$NEW_DIR" assets/project.manifest 2>/dev/null | head -3
grep -n "$NEW_DIR" version_generator.js 2>/dev/null | head -3

echo ""
echo "⚠️  重要提醒:"
echo "1. 服务器端也需要创建对应的 '$NEW_DIR' 目录"
echo "2. 将热更新文件上传到新目录"
echo "3. 测试热更新功能是否正常"
echo ""
echo "✅ 目录名修改完成!"
echo ""
echo "📁 服务器端需要创建的目录结构:"
echo "   /path/to/server/$NEW_DIR/"
echo "   ├── project.manifest"
echo "   ├── version.manifest"
echo "   └── assets/"
echo ""
echo "   /path/to/server/ldconfig/"
echo "   └── release_first.json"
echo ""
echo "🔄 如需还原，请使用备份文件: $BACKUP_DIR/"
