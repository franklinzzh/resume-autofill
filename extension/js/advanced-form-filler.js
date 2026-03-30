/**
 * 字段映射配置 - 自定义简历字段如何映射到表单
 * 用户可以根据不同招聘网站的表单结构进行调整
 */

const FIELD_MAPPING = {
  // 个人基本信息
  'firstName': {
    paths: ['个人信息.姓名'],
    keywords: ['first.name', 'firstname', 'given.name', 'first']
  },
  'lastName': {
    paths: ['个人信息.姓名'],
    keywords: ['last.name', 'lastname', 'family.name', 'surname']
  },
  'fullName': {
    paths: ['个人信息.姓名'],
    keywords: ['fullname', 'full.name', 'name', 'applicant', '姓名']
  },
  'email': {
    paths: ['个人信息.邮箱'],
    keywords: ['email', 'e-mail', 'mail', 'contact.email', '邮箱']
  },
  'phone': {
    paths: ['个人信息.电话'],
    keywords: ['phone', 'mobile', 'tel', 'telephone', 'contact.phone', '电话', '手机']
  },
  'address': {
    paths: ['个人信息.地址'],
    keywords: ['address', 'street', 'location', '地址']
  },
  'city': {
    paths: ['个人信息.城市'],
    keywords: ['city', 'town', 'location', '城市']
  },
  'country': {
    paths: ['个人信息.国家'],
    keywords: ['country', 'nation', '国家']
  },
  'github': {
    paths: ['个人信息.Github'],
    keywords: ['github', 'git.hub', 'github.url']
  },
  'linkedin': {
    paths: ['个人信息.LinkedIn'],
    keywords: ['linkedin', 'linkdin']
  },
  'website': {
    paths: ['个人信息.个人网站'],
    keywords: ['website', 'portfolio', 'personal.website', 'site', '网站']
  },

  // 教育背景
  'schoolName': {
    paths: ['教育背景[0].学校'],
    keywords: ['school', 'university', 'college', 'institution', '学校', '大学']
  },
  'major': {
    paths: ['教育背景[0].专业'],
    keywords: ['major', 'degree.program', 'program', 'field', '专业', 'field.of.study']
  },
  'degree': {
    paths: ['教育背景[0].学位'],
    keywords: ['degree', 'qualification', '学位', 'level']
  },
  'graduationDate': {
    paths: ['教育背景[0].时间'],
    keywords: ['graduation', 'graduate', 'end.date', 'graduation.date', '毕业']
  },
  'educationDescription': {
    paths: ['教育背景[0].描述'],
    keywords: ['gpa', 'honors', 'achievement', 'description', '描述', 'note']
  },

  // 工作经验
  'companyName': {
    paths: ['工作经验[0].公司'],
    keywords: ['company', 'employer', 'organization', 'firm', '公司', '企业']
  },
  'jobTitle': {
    paths: ['工作经验[0].职位'],
    keywords: ['position', 'job.title', 'role', 'title', '职位', 'job', '岗位']
  },
  'jobDescription': {
    paths: ['工作经验[0].工作内容'],
    keywords: ['description', 'responsibility', 'duty', 'work', '工作', '职责']
  },
  'employmentPeriod': {
    paths: ['工作经验[0].时间'],
    keywords: ['period', 'duration', 'date', 'time', '时间', 'from', 'to']
  },

  // 技能
  'programmingLanguages': {
    paths: ['技能.编程语言'],
    keywords: ['language', 'programming', 'coding', '编程', '语言']
  },
  'frameworks': {
    paths: ['技能.框架库'],
    keywords: ['framework', 'library', 'library', 'tool', '框架']
  },
  'tools': {
    paths: ['技能.工具'],
    keywords: ['tool', 'software', '工具']
  },
  'skills': {
    paths: ['技能.编程语言', '技能.框架库', '技能.工具'],
    keywords: ['skill', 'expertise', '技能', '能力']
  }
};

/**
 * 高级表单填充器 - 支持复杂的表单结构
 */
class AdvancedFormFiller {
  constructor(resumeData) {
    this.resumeData = resumeData;
    this.fieldMapping = FIELD_MAPPING;
    this.filledCount = 0;
  }

  /**
   * 填充页面上的所有表单
   */
  fillAllForms() {
    const forms = document.querySelectorAll('form, [role="form"]');

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const value = this.findBestValue(input);
        if (value) {
          this.fillInput(input, value);
        }
      });
    });

    return this.filledCount;
  }

  /**
   * 为单个输入字段找到最佳匹配的简历数据
   */
  findBestValue(input) {
    const fieldTexts = this.getFieldTexts(input);
    const fieldType = input.type || 'text';

    // 1. 尝试精确匹配
    for (const [mappingKey, mapping] of Object.entries(this.fieldMapping)) {
      if (this.matchesKeywords(fieldTexts, mapping.keywords)) {
        return this.getValueByPaths(mapping.paths);
      }
    }

    // 2. 尝试中文关键词匹配
    const fieldText = fieldTexts.join(' ').toLowerCase();
    if (fieldText.includes('姓名')) return this.resumeData?.个人信息?.姓名;
    if (fieldText.includes('邮箱')) return this.resumeData?.个人信息?.邮箱;
    if (fieldText.includes('电话')) return this.resumeData?.个人信息?.电话;

    return null;
  }

  /**
   * 获取表单字段的所有相关文本
   */
  getFieldTexts(input) {
    const texts = [];

    // 从各种属性收集文本
    [input.name, input.id, input.placeholder].forEach(text => {
      if (text) texts.push(text);
    });

    // aria标签
    const ariaLabel = input.getAttribute('aria-label');
    if (ariaLabel) texts.push(ariaLabel);

    // 关联的label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) texts.push(label.textContent);
    }

    // 父级文本
    const parent = input.closest('fieldset, .form-group, [role="group"]');
    if (parent) {
      const labels = parent.querySelectorAll('label');
      labels.forEach(label => texts.push(label.textContent));
    }

    return texts;
  }

  /**
   * 检查字段文本是否匹配关键词
   */
  matchesKeywords(texts, keywords) {
    return texts.some(text => {
      const textLower = text.toLowerCase();
      return keywords.some(keyword => {
        // 替换点为空格进行匹配
        const keywordPattern = keyword.replace(/\./g, ' ');
        return textLower.includes(keywordPattern) ||
               textLower.includes(keyword.replace(/\./g, ''));
      });
    });
  }

  /**
   * 根据路径数组获取简历中的值
   */
  getValueByPaths(paths) {
    for (const path of paths) {
      const value = this.getValueByPath(this.resumeData, path);
      if (value) return value;
    }
    return null;
  }

  /**
   * 根据路径获取简历中的值
   */
  getValueByPath(data, path) {
    // 支持的路径格式: 'a.b.c[0].d'
    const parts = path.match(/(\w+)|\[(\d+)\]/g) || [];

    let current = data;
    for (const part of parts) {
      if (part.startsWith('[')) {
        const index = parseInt(part.slice(1, -1));
        current = current?.[index];
      } else {
        current = current?.[part];
      }
    }

    return current;
  }

  /**
   * 填充单个输入字段
   */
  fillInput(input, value) {
    const stringValue = String(value);

    // 跳过已有值的字段
    if (input.value && input.value.trim()) return;

    input.value = stringValue;

    // 触发事件以通知JS框架
    const events = ['input', 'change', 'blur', 'keyup', 'keydown'];
    events.forEach(event => {
      try {
        input.dispatchEvent(new Event(event, { bubbles: true }));
      } catch (e) {
        console.warn(`Failed to dispatch ${event}:`, e);
      }
    });

    this.filledCount++;
  }
}

// 导出给其他脚本使用
window.AdvancedFormFiller = AdvancedFormFiller;
window.FIELD_MAPPING = FIELD_MAPPING;
