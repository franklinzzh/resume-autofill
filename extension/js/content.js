/**
 * 内容脚本 - 注入到网页中
 * 检测表单并填充简历信息
 */

// 立即标记扩展已加载 - 这必须是第一行！
window.__resumeAutoFillLoaded = true;
console.log('[Resume Autofill] Content script loaded');

// 立即监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] 收到消息:', request.action);

  if (request.action === 'fillForms') {
    const filler = new ResumeAutoFiller();
    filler.resumeData = request.data;
    filler.detectAndFillForms();
    sendResponse({ status: 'success' });
  } else if (request.action === 'scanForms') {
    const filler = new ResumeAutoFiller();
    const forms = filler.scanForForms();
    sendResponse({ forms });
  }
});

class ResumeAutoFiller {
  constructor() {
    this.resumeData = null;
    this.formFields = [];
    this.init();
  }

  async init() {
    // 从storage加载简历数据
    chrome.storage.local.get('resumeData', (result) => {
      if (result.resumeData) {
        this.resumeData = result.resumeData;
        this.detectAndFillForms();
      }
    });

    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'fillForms') {
        this.resumeData = request.data;
        this.detectAndFillForms();
        sendResponse({ status: 'success' });
      } else if (request.action === 'scanForms') {
        const forms = this.scanForForms();
        sendResponse({ forms });
      }
    });
  }

  // 扫描页面中的所有表单
  scanForForms() {
    const forms = [];
    document.querySelectorAll('form, [role="form"]').forEach((form) => {
      const fields = this.extractFormFields(form);
      if (fields.length > 0) {
        forms.push({
          id: form.id || `form-${Math.random()}`,
          name: form.name || '未命名表单',
          fieldCount: fields.length,
          fields: fields
        });
      }
    });
    return forms;
  }

  // 提取表单中的所有字段
  extractFormFields(form) {
    const fields = [];

    // 查找所有输入字段
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      if (field.type === 'hidden') return;

      const fieldInfo = {
        name: field.name || field.id || '',
        type: field.type,
        placeholder: field.placeholder || '',
        label: this.findLabel(field),
        id: field.id || '',
        ariaLabel: field.getAttribute('aria-label') || '',
        value: field.value || ''
      };

      fields.push(fieldInfo);
    });

    return fields;
  }

  // 查找字段关联的label
  findLabel(field) {
    // 尝试find关联的label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent.trim();
    }

    // 尝试查找父级label
    const parentLabel = field.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.trim().replace(field.value, '').trim();
    }

    return '';
  }

  // 检测并填充表单
  detectAndFillForms() {
    if (!this.resumeData) return;

    const forms = document.querySelectorAll('form, [role="form"]');
    let filledCount = 0;

    forms.forEach((form) => {
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach((field) => {
        const mappedValue = this.mapFieldValue(field);
        if (mappedValue) {
          this.fillField(field, mappedValue);
          filledCount++;
        }
      });
    });

    // 发送填充结果通知
    if (filledCount > 0) {
      this.showNotification(`✅ 成功填充 ${filledCount} 个字段`);
    }
  }

  // 映射字段值 - 智能匹配
  mapFieldValue(field) {
    const fieldName = (field.name + field.id + field.placeholder).toLowerCase();
    const ariaLabel = field.getAttribute('aria-label')?.toLowerCase() || '';
    const label = this.findLabel(field).toLowerCase();
    const cellText = (label + fieldName + ariaLabel).toLowerCase();

    // 个人信息匹配
    if (this.matches(cellText, ['名字', '姓名', 'name', 'first name', 'fullname'])) {
      return this.resumeData.个人信息?.姓名 || '';
    }
    if (this.matches(cellText, ['电话', 'phone', 'mobile', 'contact'])) {
      return this.resumeData.个人信息?.电话 || '';
    }
    if (this.matches(cellText, ['邮箱', 'email', 'e-mail', 'mail'])) {
      return this.resumeData.个人信息?.邮箱 || '';
    }
    if (this.matches(cellText, ['github', 'git hub'])) {
      return this.resumeData.个人信息?.Github || '';
    }
    if (this.matches(cellText, ['linkedin'])) {
      return this.resumeData.个人信息?.LinkedIn || '';
    }
    if (this.matches(cellText, ['网站', 'website', 'personal website'])) {
      return this.resumeData.个人信息?.个人网站 || '';
    }

    // 教育背景匹配
    if (this.matches(cellText, ['学校', '大学', 'university', 'school', 'college'])) {
      return this.resumeData.教育背景?.[0]?.学校 || '';
    }
    if (this.matches(cellText, ['专业', 'major', 'degree program'])) {
      return this.resumeData.教育背景?.[0]?.专业 || '';
    }
    if (this.matches(cellText, ['学位', '学历', 'degree'])) {
      return this.resumeData.教育背景?.[0]?.学位 || '';
    }

    // 工作经验匹配
    if (this.matches(cellText, ['公司', 'company', 'employer', 'organization'])) {
      return this.resumeData.工作经验?.[0]?.公司 || '';
    }
    if (this.matches(cellText, ['职位', '职务', 'position', 'title', 'job title'])) {
      return this.resumeData.工作经验?.[0]?.职位 || '';
    }
    if (this.matches(cellText, ['工作', 'work', 'responsibility', 'description'])) {
      return this.resumeData.工作经验?.[0]?.工作内容 || '';
    }

    // 技能匹配
    if (this.matches(cellText, ['技能', 'skill', 'language', 'programming'])) {
      const allSkills = [
        ...this.resumeData.技能?.编程语言 || [],
        ...this.resumeData.技能?.框架库 || [],
        ...this.resumeData.技能?.工具 || []
      ];
      return allSkills.join(', ') || '';
    }

    return null;
  }

  // 模糊匹配关键词
  matches(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // 填充字段
  fillField(field, value) {
    field.value = value;

    // 触发change事件，以便React等框架能响应
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // 显示通知
  showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ResumeAutoFiller();
  });
} else {
  new ResumeAutoFiller();
}
