# 简历自动填充浏览器扩展

🚀 一个智能的浏览器扩展，能自动识别工作申请表单，并填充你的简历信息。

## 功能特性

✨ **自动表单识别** - 检测网页中的所有表单字段
📋 **智能字段匹配** - 使用相似度算法匹配简历字段和表单字段
🎯 **一键填充** - 自动填充所有匹配的字段
💾 **本地存储** - 简历数据存储在浏览器本地
🔗 **API导入** - 支持从后端API动态加载简历

## 工作流程

```
1. 上传/导入简历JSON
   ↓
2. 保存到浏览器本地存储
   ↓
3. 打开工作申请网页
   ↓
4. 点击扩展图标 → 点击"扫描表单"
   ↓
5. 点击"自动填充" → 自动匹配并填充字段
```

## 安装步骤

### Chrome/Edge

1. 将extension文件夹复制到本地
2. 打开 `chrome://extensions/`
3. 启用 "开发者模式" (右上角)
4. 点击 "加载未打包的扩展程序"
5. 选择 `extension` 文件夹

### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击 "加载临时附加组件"
3. 选择 `extension/manifest.json`

## 简历JSON格式

```json
{
  "个人信息": {
    "姓名": "张三",
    "电话": "13800138000",
    "邮箱": "user@example.com",
    "Github": "github.com/username",
    "LinkedIn": "linkedin.com/in/username",
    "个人网站": "example.com"
  },
  "教育背景": [
    {
      "学校": "大学名称",
      "专业": "计算机科学",
      "学位": "理学学士",
      "时间": "2020.09-2024.06",
      "描述": "主要课程：...; GPA: 3.7/4.0"
    }
  ],
  "工作经验": [
    {
      "公司": "公司名称",
      "职位": "软件工程师",
      "时间": "2024.07-至今",
      "工作内容": "...",
      "主要成就": ["成就1", "成就2"]
    }
  ],
  "技能": {
    "编程语言": ["Java", "Python", "JavaScript"],
    "框架库": ["Spring Boot", "React", "Django"],
    "工具": ["Git", "Docker", "Jenkins"],
    "其他": ["Linux", "AWS"]
  },
  "项目经验": [
    {
      "项目名": "项目名称",
      "角色": "开发人员",
      "时间": "2023.01-2023.06",
      "技术栈": ["Java", "MySQL"],
      "项目描述": "...",
      "主要成就": ["成就1"]
    }
  ],
  "其他": {
    "获奖": ["奖项1"],
    "证书": ["证书1"],
    "发表": ["发表1"]
  }
}
```

## 文件结构

```
extension/
├── manifest.json           # 扩展配置文件
├── popup.html             # 弹出窗口UI
├── js/
│   ├── popup.js          # 弹出窗口逻辑
│   ├── content.js        # 内容脚本（注入到网页）
│   ├── background.js     # 后台服务
│   └── form-matcher.js   # 表单匹配算法
├── css/
│   └── popup.css         # UI样式
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## 字段匹配规则

扩展使用模糊匹配算法来识别表单字段：

- **个人信息**: 名字、电话、邮箱、GitHub、LinkedIn等
- **教育背景**: 学校、专业、学位、时间
- **工作经验**: 公司、职位、时间、工作描述
- **技能**: 编程语言、框架、工具等

## 后端API集成

如果你使用了本项目配套的Python后端，可以这样配置：

1. 启动FastAPI后端：
```bash
python app/main.py
```

2. 在扩展popup中设置API地址：
```
http://localhost:8000/api/resume
```

3. 点击"从API加载"按钮

## 安全性

- ✅ 简历数据仅存储在本地浏览器
- ✅ 不会发送到任何服务器（除非使用API导入）
- ✅ 支持HTTPS传输
- ✅ 扩展代码完全开源透明

## 高级设置

### 自定义匹配规则

编辑 `js/form-matcher.js` 中的 `matchRules` 对象来添加自定义字段匹配规则：

```javascript
this.matchRules = {
  '自定义类别': {
    '字段名': ['关键词1', '关键词2', '中文关键词']
  }
};
```

### 调试表单字段

打开浏览器开发者工具 (F12)，在Console中执行：

```javascript
// 扫描并列出所有表单字段
document.querySelectorAll('input, textarea, select').forEach(field => {
  console.log({
    name: field.name,
    id: field.id,
    type: field.type,
    placeholder: field.placeholder
  });
});
```

## API端点

如果使用后端服务，可用的端点：

### GET /api/resume
返回已保存的简历JSON

```bash
curl http://localhost:8000/api/resume
```

### POST /api/resume/parse
从PDF提取并解析简历

```bash
curl -X POST -F "file=@resume.pdf" http://localhost:8000/api/resume/parse
```

## 故障排除

### 扩展无法自动填充

1. 检查网页是否包含表单字段
2. 点击"扫描表单"查看识别到的字段
3. 查看浏览器Console (F12) 中的错误信息

### 字段识别不准确

- 扩展会尝试匹配label、name、id、placeholder等属性
- 如果某个网站的表单结构特殊，可能需要手动调整匹配规则

### API连接失败

- 确保后端服务在运行
- 检查API地址是否正确（包括端口号）
- 查看浏览器Console中的CORS错误信息

## 贡献

欢迎提交Issue和Pull Request！

## License

MIT

---

**版本**: 1.0.0
**最后更新**: 2026-03-30
