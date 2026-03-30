/**
 * Popup脚本 - 用户交互界面
 */

class ResumeAutoFillUI {
  constructor() {
    this.resumeData = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadStoredResume();
  }

  setupEventListeners() {
    // 文件上传
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.background = '#f0f0f0';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.background = '';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.background = '';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // 扫描表单
    document.getElementById('scanBtn').addEventListener('click', () => this.scanForms());

    // 自动填充
    document.getElementById('fillBtn').addEventListener('click', () => this.fillCurrentTab());

    // API导入
    document.getElementById('fetchBtn').addEventListener('click', () => this.fetchFromAPI());
  }

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.resumeData = JSON.parse(e.target.result);
        this.saveResume();
        this.showPreview();
        document.getElementById('fillBtn').disabled = false;
        this.showStatus('✅ 简历加载成功', 'success');
      } catch (error) {
        this.showStatus('❌ JSON格式错误: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  fetchFromAPI() {
    const apiUrl = document.getElementById('apiUrl').value;
    if (!apiUrl) {
      this.showStatus('❌ 请输入API地址', 'error');
      return;
    }

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        this.resumeData = data;
        this.saveResume();
        this.showPreview();
        document.getElementById('fillBtn').disabled = false;
        this.showStatus('✅ 从API加载成功', 'success');
      })
      .catch((error) => {
        this.showStatus('❌ API请求失败: ' + error.message, 'error');
      });
  }

  saveResume() {
    chrome.runtime.sendMessage(
      { action: 'saveResume', data: this.resumeData },
      (response) => {
        console.log('Resume saved:', response);
      }
    );
  }

  loadStoredResume() {
    try {
      chrome.runtime.sendMessage({ action: 'getResume' }, (response) => {
        if (response && response.data) {
          this.resumeData = response.data;
          this.showPreview();
          document.getElementById('fillBtn').disabled = false;
        }
      });
    } catch (error) {
      console.warn('Failed to load stored resume:', error);
    }
  }

  showPreview() {
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');

    if (this.resumeData) {
      let html = '';

      // 个人信息
      if (this.resumeData.个人信息) {
        html += `<div class="preview-item">
          <h3>👤 个人信息</h3>
          <p><strong>姓名:</strong> ${this.resumeData.个人信息.姓名}</p>
          <p><strong>电话:</strong> ${this.resumeData.个人信息.电话}</p>
          <p><strong>邮箱:</strong> ${this.resumeData.个人信息.邮箱}</p>
        </div>`;
      }

      // 教育背景
      if (this.resumeData.教育背景 && this.resumeData.教育背景.length > 0) {
        const edu = this.resumeData.教育背景[0];
        html += `<div class="preview-item">
          <h3>🎓 教育背景</h3>
          <p><strong>学校:</strong> ${edu.学校}</p>
          <p><strong>专业:</strong> ${edu.专业}</p>
        </div>`;
      }

      // 工作经验
      if (this.resumeData.工作经验 && this.resumeData.工作经验.length > 0) {
        const work = this.resumeData.工作经验[0];
        html += `<div class="preview-item">
          <h3>💼 工作经验</h3>
          <p><strong>公司:</strong> ${work.公司}</p>
          <p><strong>职位:</strong> ${work.职位}</p>
        </div>`;
      }

      // 技能
      if (this.resumeData.技能) {
        const skills = [
          ...(this.resumeData.技能.编程语言 || []),
          ...(this.resumeData.技能.框架库 || [])
        ];
        if (skills.length > 0) {
          html += `<div class="preview-item">
            <h3>🛠️ 技能</h3>
            <p>${skills.join(', ')}</p>
          </div>`;
        }
      }

      previewContent.innerHTML = html;
      previewSection.style.display = 'block';
    }
  }

  scanForms() {
    const statusMsg = document.getElementById('statusMessage');
    statusMsg.textContent = '🔍 正在扫描...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        this.showStatus('❌ 无法获取当前标签页', 'error');
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'scanForms' },
        (response) => {
          // 检查是否有错误
          if (chrome.runtime.lastError) {
            this.showStatus('❌ 请在工作申请网页上使用', 'error');
            return;
          }
          if (response && response.forms) {
            this.displayForms(response.forms);
            this.showStatus(`✅ 发现 ${response.forms.length} 个表单`, 'success');
          } else {
            this.showStatus('❌ 未找到表单字段', 'error');
          }
        }
      );
    });
  }

  displayForms(forms) {
    const formsList = document.getElementById('formsList');
    const formsPanel = document.getElementById('formsPanel');

    let html = '';
    forms.forEach((form, index) => {
      html += `
        <div class="form-item">
          <h4>📋 表单 ${index + 1}: ${form.name}</h4>
          <p>字段数: <strong>${form.fieldCount}</strong></p>
          <button class="btn btn-small" onclick="fillForm('${form.id}')">填充此表单</button>
        </div>
      `;
    });

    formsList.innerHTML = html;
    formsPanel.style.display = 'block';
  }

  fillCurrentTab() {
    if (!this.resumeData) {
      this.showStatus('❌ 请先加载简历', 'error');
      return;
    }

    const statusMsg = document.getElementById('statusMessage');
    statusMsg.textContent = '⏳ 正在填充...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        this.showStatus('❌ 无法获取当前标签页', 'error');
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'fillForms', data: this.resumeData },
        (response) => {
          // 检查是否有错误
          if (chrome.runtime.lastError) {
            this.showStatus('❌ 请在工作申请网页上使用', 'error');
            return;
          }
          if (response && response.status === 'success') {
            this.showStatus('✅ 填充完成', 'success');
          }
        }
      );
    });
  }

  showStatus(message, type) {
    const statusMsg = document.getElementById('statusMessage');
    statusMsg.textContent = message;
    statusMsg.className = `status-message ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        statusMsg.textContent = '';
      }, 3000);
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ResumeAutoFillUI();
});
