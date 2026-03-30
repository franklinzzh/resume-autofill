# 🎯 简历自动填充系统

> 🚀 使用Qwen大模型API自动解析简历PDF，通过浏览器扩展智能填充工作申请表单。

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 📄 **PDF提取** | PyMuPDF自动从PDF提取文本 |
| 🤖 **智能解析** | Qwen API将简历文本转换为结构化JSON |
| 💾 **本地存储** | 简历安全存储在浏览器本地，不上传服务器 |
| 🔍 **表单识别** | 自动检测网页中的所有表单字段 |
| 🧠 **智能匹配** | 相似度算法自动匹配简历字段到表单输入框 |
| ⚡ **一键填充** | 点击按钮自动填充所有匹配的字段 |
| 🔗 **API集成** | 支持从后端动态加载简历 |

## 🏗️ 项目架构

```
┌─────────────────────────────────────────────────┐
│      用户提供 PDF 简历 / JSON 简历              │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────┐        ┌────────────┐
    │  后端服务   │        │ 浏览器扩展 │
    │  FastAPI    │        │  JavaScript│
    └──────┬──────┘        └────────┬───┘
           │                        │
      ┌────┴────────────────────┬───┘
      │                         │
    [PDF解析]        [简历加载存储]
      │                    │
    [Qwen API]         [表单识别]
      │                    │
  [结构化JSON]        [智能匹配]
      │                    │
      └────────┬───────────┘
               │
        ┌──────▼──────┐
        │  自动填充   │
        │  工作申请   │
        └─────────────┘
```

## 📚 快速开始

### 1️⃣ 安装

```bash
# 克隆项目（如已有）或创建新目录
cd resume-autofill

# 安装Python依赖
pip install -r requirements.txt
```

### 2️⃣ 配置API密钥

```bash
# 创建 .env 文件，获取Qwen API密钥
# 访问: https://dashscope.console.aliyun.com/

echo "DASHSCOPE_API_KEY=sk-your-key-here" > .env
```

### 3️⃣ 启动后端 API

```bash
python -m app.main

# 输出:
# Uvicorn running on http://0.0.0.0:8000
```

### 4️⃣ 安装浏览器扩展

**Chrome/Edge:**
1. 打开 `chrome://extensions/`
2. 启用 "开发者模式" (右上角)
3. 点击 "加载未打包的扩展程序"
4. 选择 `extension` 文件夹

**Firefox:**
1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击 "加载临时附加组件"
3. 选择 `extension/manifest.json`

### 5️⃣ 使用扩展

```
1. 点击扩展图标 → 选择简历JSON/PDF
2. 或点击 "📡 API方式导入" → 输入 http://localhost:8000/api/resume
3. 打开工作申请网页
4. 点击 "🔍 扫描表单" → "✨ 自动填充"
5. 检查并提交表单
```

## 📁 文件目录

```
resume-autofill/
├── app/
│   ├── main.py                 # ⭐ FastAPI + API端点
│   ├── resume_parser.py        # ⭐ Qwen解析核心
│   ├── submit_form.py          # PDF读取器
│   └── ...
├── extension/
│   ├── manifest.json           # ⭐ 扩展配置
│   ├── popup.html              # UI界面
│   ├── js/
│   │   ├── popup.js            # ⭐ UI逻辑
│   │   ├── content.js          # ⭐ 表单填充
│   │   ├── form-matcher.js     # 字段识别
│   │   └── advanced-form-filler.js
│   └── css/popup.css
├── QUICKSTART.md               # 👈 新用户从这里开始
├── EXTENSION_README.md         # 扩展详细文档
├── IMPLEMENTATION_GUIDE.md     # 完整实现指南
├── parsed_resume.json          # 解析后的简历示例
├── requirements.txt            # 依赖列表
├── .env                        # 环境变量（创建）
└── test_form.html              # 测试表单页面
```

## 🔗 API 端点

### 获取简历
```bash
GET http://localhost:8000/api/resume

# 返回结构化简历JSON
```

### 解析PDF
```bash
POST http://localhost:8000/api/resume/parse
Content-Type: multipart/form-data

file: <PDF文件>

# 自动使用Qwen API解析并返回JSON
```

### 上传JSON
```bash
POST http://localhost:8000/api/resume/upload
Content-Type: multipart/form-data

file: <简历JSON>
```

## 🧠 智能匹配原理

扩展使用**三层相似度匹配算法**：

```javascript
// 1. 精确匹配 (score = 1.0)
if (fieldText === "姓名") → 填充 "个人信息.姓名"

// 2. 包含关系 (score = 0.8)
if (fieldText.includes("email")) → 填充 "个人信息.邮箱"

// 3. Levenshtein距离 (score = 相似度%)
levenshteinDistance("fullname", "full name") → 高相似度
```

## 💡 使用示例

### 方式A: 本地JSON上传

1. 扩展中点击"📁 点击选择JSON文件"
2. 选择 `parsed_resume.json`
3. 打开工作申请网页，点击"自动填充"

### 方式B: API动态加载

```javascript
// 扩展将自动从 http://localhost:8000/api/resume 加载
// 并缓存到浏览器本地

GET /api/resume → 浏览器本地存储 → 自动填充表单
```

### 方式C: PDF直接解析

```bash
# 后端接收PDF，返回结构化JSON
curl -X POST -F "file=@resume.pdf" \
  http://localhost:8000/api/resume/parse

# 返回
{
  "status": "success",
  "data": {
    "个人信息": {...},
    "教育背景": [...],
    "工作经验": [...]
  }
}
```

## 🔒 安全机制

✅ **数据隐私**
- 简历仅缓存在浏览器本地（IndexedDB/LocalStorage）
- 不会自动同步到任何云服务

✅ **API安全**
- Qwen API密钥存储在后端 `.env` 文件
- 扩展不接触敏感凭据

✅ **网络安全**
- 完全支持HTTPS
- CORS配置仅允许必要的跨域请求

✅ **代码安全**
- 无任意代码执行
- 不修改网站脚本和样式

## 📖 详细文档

| 文档 | 内容 |
|------|------|
| **QUICKSTART.md** | 快速入门，15分钟上手 |
| **EXTENSION_README.md** | 扩展功能和故障排除 |
| **IMPLEMENTATION_GUIDE.md** | 完整的技术实现指南 |
| **test_form.html** | 测试用的申请表单 |

## 🛠️ 技术栈

**后端:**
- Python 3.13
- FastAPI 0.104.1
- Qwen API (通过dashscope SDK)
- PyMuPDF 1.27+ (PDF文本提取)
- SQLAlchemy 2.0 (可选数据库)

**浏览器扩展:**
- Manifest V3 (现代扩展标准)
- Chrome Storage API
- Content Scripts (网页注入)
- 原生JavaScript (无框架)

## 🧪 测试

```bash
# 打开测试表单
file:///path/to/test_form.html

# 或用Python启动本地服务器
python -m http.server 8001
# 访问 http://localhost:8001/test_form.html

# 加载扩展，点击自动填充，观察表单被填充
```

## ❓ 常见问题

### Q: 扩展会上传我的简历吗？
A: 不会。简历在浏览器本地处理，除非你明确使用API导入功能。

### Q: 支持哪些网站？
A: 扩展支持任何带有标准HTML表单的网站（`<input>`, `<textarea>`, `<select>`）。

### Q: 如何自定义字段匹配？
A: 编辑 `extension/js/advanced-form-filler.js` 中的 `FIELD_MAPPING` 对象。

### Q: PDF解析不准确怎么办？
A:
- 确保PDF是文本型（非扫描图片）
- 调整 `resume_parser.py` 中的Qwen模型参数
- 手动编辑 `parsed_resume.json`

## 🐛 故障排除

**问题：扩展无法加载**
```bash
# 1. 检查浏览器版本是否支持Manifest V3 (Chrome 88+)
# 2. 确保manifest.json格式正确
# 3. 查看浏览器扩展页面的错误信息
```

**问题：表单无法填充**
```javascript
// 打开F12，查看Console中是否有错误
// 运行以下代码检查表单字段：
document.querySelectorAll('input').forEach((el, i) => {
  console.log(`${i}:`, el.name, el.id, el.type);
});
```

**问题：API连接失败**
```bash
# 1. 确保后端运行: python -m app.main
# 2. 检查防火墙: http://localhost:8000/health
# 3. 检查API密钥: grep DASHSCOPE .env
```

## 🚀 部署

### 本地开发
```bash
python -m app.main  # 后端运行在 localhost:8000
# 加载本地扩展进行测试
```

### 生产部署
```bash
# Docker化后端
docker build -t resume-autofill .
docker run -p 8000:8000 -e DASHSCOPE_API_KEY=... resume-autofill

# 扩展上架Chrome Web Store或Firefox Add-ons
```

## 📈 参数优化

### Qwen API参数 (`resume_parser.py`)
```python
# 调整模型
model="qwen-turbo"      # 快速+便宜，推荐
model="qwen-plus"       # 平衡
model="qwen-max"        # 最准确

# 调整采样参数
temperature=0.7  # 创意度 (0-2)
top_p=0.8        # 多样性 (0-1)
```

### 匹配灵敏度 (`content.js`)
```javascript
// 调整匹配阈值
if (similarity > 0.5) { ... }  // 阈值0.5
// 降低阈值 → 更容易匹配但可能误匹配
// 提高阈值 → 更准确但可能漏匹配
```

## 📊 项目统计

- 后端: ~300 lines Python
- 扩展: ~800 lines JavaScript
- 文档: ~2000 words
- 支持字段: 50+
- API端点: 3个
- 浏览器: Chrome/Firefox/Edge

## 🤝 贡献

欢迎PR和Issue！

1. Fork项目
2. 创建Feature分支 (`git checkout -b feature/amazing`)
3. 提交改动 (`git commit -m 'Add amazing feature'`)
4. Push到分支 (`git push origin feature/amazing`)
5. 创建Pull Request

## 📱 反馈

- 📧 Email: feedback@resumeautofill.dev
- 🐛 Issue: [GitHub Issues](https://github.com/you/resume-autofill/issues)
- 💬 Discussion: [GitHub Discussions](https://github.com/you/resume-autofill/discussions)

## 📄 License

MIT License © 2026

---

## 🎉 致谢

- [Qwen](https://dashscope.console.aliyun.com/) - 强大的大模型API
- [FastAPI](https://fastapi.tiangolo.com/) - 现代Web框架
- [PyMuPDF](https://pymupdf.readthedocs.io/) - PDF处理库
- 所有使用和贡献者

---

<div align="center">

**[快速开始](QUICKSTART.md)** • **[扩展文档](EXTENSION_README.md)** • **[实现指南](IMPLEMENTATION_GUIDE.md)**

Made with ❤️ for job seekers

</div>
