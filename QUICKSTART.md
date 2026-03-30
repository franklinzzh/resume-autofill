# 快速入门指南

## 项目架构

```
resume-autofill/
├── app/                      # Python后端
│   ├── main.py              # FastAPI应用 + 简历API端点
│   ├── resume_parser.py     # 使用Qwen API解析简历
│   ├── submit_form.py       # PDF读取器
│   └── ...
│
├── extension/               # 浏览器扩展
│   ├── manifest.json        # 扩展配置
│   ├── popup.html           # 用户界面
│   ├── js/
│   │   ├── content.js              # 网页内容脚本
│   │   ├── popup.js                # UI交互逻辑
│   │   ├── background.js           # 后台服务
│   │   ├── form-matcher.js         # 表单识别
│   │   └── advanced-form-filler.js # 高级填充逻辑
│   └── css/
│       └── popup.css        # 样式
│
├── parsed_resume.json       # 解析后的简历JSON
└── requirements.txt         # Python依赖
```

## 使用步骤

### 1️⃣ 安装依赖

```bash
pip install -r requirements.txt
```

### 2️⃣ 启动后端服务

```bash
python -m app.main
# 服务将运行在 http://localhost:8000
```

### 3️⃣ 安装浏览器扩展

#### Chrome

1. 访问 `chrome://extensions/`
2. 启用 "开发者模式"
3. 点击 "加载未打包的扩展程序"
4. 选择 `extension` 文件夹

#### Firefox

1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击 "加载临时附加组件"
3. 选择 `extension/manifest.json`

### 4️⃣ 使用扩展

**方式A: 上传简历JSON**
```
1. 点击扩展图标 → 弹出窗口
2. 点击"📁 点击选择JSON文件"
3. 选择已解析的简历JSON文件
4. 简历加载完成
```

**方式B: 从API加载**
```
1. 点击扩展图标
2. 展开"📡 API方式导入"
3. 输入API地址：http://localhost:8000/api/resume
4. 点击"从API加载"
```

**方式C: 从PDF增量解析**
```bash
# 后端API可以接收PDF并自动解析
curl -X POST -F "file=@your_resume.pdf" \
  http://localhost:8000/api/resume/parse
```

### 5️⃣ 自动填充表单

```
1. 打开工作申请网站
2. 点击扩展图标
3. 点击"🔍 扫描当前页面" - 检测表单字段
4. 点击"✨ 自动填充所有字段" - 匹配并填充
5. 检查填充的内容，手动调整如需要
6. 提交表单
```

## 工作流程图

```
PDF简历
  ↓
[Qwen API解析]
  ↓
JSON格式化
  ↓
本地/API存储
  ↙        ↘
浏览器扩展  后端API
  ↓
表单识别
  ↓
智能匹配
  ↓
自动填充
  ↓
用户确认
  ↓
提交申请
```

## 关键功能清单

- ✅ **PDF → JSON**: 使用Qwen API自动解析简历
- ✅ **本地存储**: 简历保存在浏览器本地，数据隐私安全
- ✅ **表单识别**: 智能检测网页中的表单字段
- ✅ **智能匹配**: 相似度算法自动匹配简历字段
- ✅ **一键填充**: 自动填充所有匹配的字段
- ✅ **API集成**: 支持从后端API加载简历
- ✅ **事件通知**: 兼容React、Vue等现代框架

## API文档

### 获取已解析的简历
```
GET /api/resume

响应:
{
  "个人信息": {...},
  "教育背景": [...],
  ...
}
```

### 从PDF解析简历
```
POST /api/resume/parse
Content-Type: multipart/form-data

file: <PDF文件>

响应:
{
  "status": "success",
  "data": {...},
  "message": "Resume parsed successfully"
}
```

### 上传简历JSON
```
POST /api/resume/upload
Content-Type: multipart/form-data

file: <JSON文件>
```

## 常见问题

### Q: 简历数据是否会上传到服务器？
A: 不会。扩展首先从API加载数据，然后完全在浏览器本地运行，不会再次上传。

### Q: 如何添加自定义字段匹配？
A: 编辑 `extension/js/advanced-form-filler.js` 中的 `FIELD_MAPPING` 对象。

### Q: 为什么某些字段无法自动填充？
A: 不同网站的表单结构差异很大。可以通过以下方式调试：
1. 打开浏览器开发者工具 (F12)
2. 查看表单字段的 name/id/placeholder
3. 添加相应的关键词到匹配规则

### Q: 支持哪些浏览器？
A: Chrome、Edge、Firefox 都支持，Safari需要用不同的方式部署。

## 故障排除

### 扩展无法识别表单
```javascript
// 打开Console，运行以下代码查看所有表单字段
document.querySelectorAll('input, textarea, select').forEach((el, i) => {
  console.log(`字段${i}:`, {
    name: el.name,
    id: el.id,
    type: el.type,
    placeholder: el.placeholder
  });
});
```

### API连接失败
1. 确保后端服务在运行: `python -m app.main`
2. 检查防火墙和端口
3. 查看浏览器Console的CORS错误

### JSON解析失败
- 确保简历JSON格式正确
- 使用在线JSON验证器检查格式

## 下一步

1. 📚 查看 `EXTENSION_README.md` 了解扩展详细文档
2. 🔧 根据目标网站调整字段匹配规则
3. 🚀 在更多招聘网站上测试
4. 📝 反馈问题和建议

## 技术栈

**后端**:
- FastAPI - Web框架
- Qwen API - 大模型解析
- PyMuPDF - PDF读取
- SQLAlchemy - 数据库ORM

**浏览器扩展**:
- Manifest V3 - 扩展标准
- Content Scripts - 网页注入
- Chrome Storage API - 数据存储
- Vanilla JavaScript - 核心逻辑

---

问题或建议？欢迎提交Issue！
