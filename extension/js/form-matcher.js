/**
 * 表单匹配器 - 高级表单识别和填充逻辑
 * 提供更智能的字段匹配算法
 */

class FormMatcher {
  constructor() {
    // 字段匹配规则库
    this.matchRules = {
      '个人信息': {
        '姓名': ['name', 'fullname', 'first.name', 'last.name', '姓名', '名字', '申请人', 'candidate'],
        '电话': ['phone', 'mobile', 'tel', 'telephone', '电话', '手机'],
        '邮箱': ['email', 'mail', 'e-mail', '邮箱', '邮件'],
        '城市': ['city', 'location', '城市', '地区'],
        '地址': ['address', 'street', '地址'],
      },
      '教育背景': {
        '学校': ['school', 'university', 'college', '学校', '大学', '院校', 'institution'],
        '专业': ['major', 'degree', 'program', '专业', '学位', 'field'],
        '学位': ['degree', 'qualification', '学位', '学历'],
        '时间': ['time', 'period', 'duration', '时间', '年份', 'year'],
      },
      '工作经验': {
        '公司': ['company', 'employer', 'organization', '公司', '企业', '机构'],
        '职位': ['position', 'title', 'role', '职位', '职务', '岗位'],
        '时间': ['time', 'period', '时间', '年份'],
        '工作内容': ['responsibility', 'description', 'work', '工作', '描述', '职责'],
      },
      '技能': ['skill', 'expertise', 'language', '技能', '专项', '能力', '语言'],
      '项目': ['project', 'portfolio', '项目', '作品'],
    };
  }

  /**
   * 计算两个字符串的相似度 (0-1)
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // 包含关系
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Levenshtein距离
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算Levenshtein距离
   */
  levenshteinDistance(s1, s2) {
    const costs = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }

  /**
   * 获取字段的所有可用文本信息
   */
  getFieldTexts(field) {
    const texts = [];

    // field属性
    if (field.name) texts.push(field.name);
    if (field.id) texts.push(field.id);
    if (field.placeholder) texts.push(field.placeholder);

    // aria标签
    const ariaLabel = field.getAttribute('aria-label');
    if (ariaLabel) texts.push(ariaLabel);

    // label文本
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) texts.push(label.textContent);
    }

    // 从父级获取文本
    const parent = field.closest('fieldset, .form-group, [role="group"]');
    if (parent) {
      const parentText = parent.textContent;
      if (parentText) texts.push(parentText);
    }

    return texts;
  }

  /**
   * 匹配格式类型（判断字段是否为数组、对象等）
   */
  getExpectedType(fieldTexts) {
    const text = fieldTexts.join(' ').toLowerCase();

    // 多选或数组类型
    if (text.includes('skill') || text.includes('language') ||
        text.includes('技能') || text.includes('语言')) {
      return 'array';
    }

    // 日期类型
    if (text.includes('date') || text.includes('time') ||
        text.includes('年') || text.includes('月')) {
      return 'date';
    }

    return 'string';
  }

  /**
   * 智能匹配简历字段
   */
  matchResumeField(fieldTexts, resumeData) {
    let bestMatch = null;
    let bestScore = 0;

    // 遍历简历中所有可能的匹配项
    this.iterateResume(resumeData, (path, value, label) => {
      let maxSimilarity = 0;

      // 对字段的每个文本进行相似度比较
      for (const fieldText of fieldTexts) {
        const similarity = this.calculateSimilarity(fieldText, label);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
      }

      // 权重调整：精确匹配得分更高
      if (maxSimilarity > 0.5 && maxSimilarity > bestScore) {
        bestMatch = value;
        bestScore = maxSimilarity;
      }
    });

    return bestMatch;
  }

  /**
   * 迭代简历数据的所有字段
   */
  iterateResume(data, callback, prefix = '') {
    if (typeof data !== 'object' || data === null) {
      return;
    }

    for (const [key, value] of Object.entries(data)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          this.iterateResume(item, callback, `${path}[${index}]`);
        });
      } else if (typeof value === 'object') {
        this.iterateResume(value, callback, path);
      } else if (typeof value === 'string') {
        // 调用回调，传递路径、值和用于匹配的标签
        callback(path, value, key);
      }
    }
  }

  /**
   * 获取简历中指定路径的值
   */
  getValueByPath(data, path) {
    const parts = path.split(/[\.\[\]]/).filter(p => p);
    let current = data;

    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  }
}

// 导出给其他脚本使用
window.FormMatcher = FormMatcher;
