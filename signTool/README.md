# Android签名工具集

这个文件夹包含了Android应用签名相关的工具脚本。

## 📁 文件说明

### 🔧 工具脚本
- **`generate_keystore.sh`** - Android签名生成工具
- **`get_md5_signature.sh`** - MD5签名值获取工具
- **`change_package.sh`** - 包名修改工具

### 📖 文档
- **`签名生成说明.md`** - 详细使用说明文档
- **`README.md`** - 本说明文件

## 🚀 快速开始

### 1. 生成新签名
```bash
cd signTool
./generate_keystore.sh myapp
```

### 2. 获取MD5签名值
```bash
cd signTool
./get_md5_signature.sh myapp.keystore myapp
```

### 3. 修改包名
```bash
cd signTool
./change_package.sh com.newcompany.newapp myapp.keystore wx1234567890abcdef
```

### 4. 还原包名
```bash
cd signTool
./change_package.sh restore
```

### 5. 查看详细说明
```bash
cd signTool
cat 签名生成说明.md
```

## 📋 使用场景

- **修改包名**：需要重新生成签名和更新配置
- **微信开放平台**：需要MD5签名值
- **应用商店**：需要签名文件
- **安全更新**：更换签名文件
- **多版本管理**：为不同版本使用不同包名

## ⚠️ 注意事项

1. **备份重要**：修改前请备份原有签名文件
2. **密码安全**：妥善保存签名密码
3. **版本控制**：不要将签名文件提交到Git
4. **测试环境**：先在测试环境验证

## 🔗 相关链接

- [微信开放平台](https://open.weixin.qq.com/)
- [Android签名文档](https://developer.android.com/studio/publish/app-signing)
