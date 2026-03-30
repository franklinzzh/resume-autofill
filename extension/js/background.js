/**
 * 后台服务工作器
 * 管理扩展的后台任务和消息
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('简历自动填充助手已安装');
  // 初始化存储
  chrome.storage.local.get('resumeData', (result) => {
    if (!result.resumeData) {
      chrome.storage.local.set({ resumeData: null });
    }
  });
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveResume') {
    chrome.storage.local.set({ resumeData: request.data }, () => {
      // 通知所有content scripts更新
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'resumeUpdated',
            data: request.data
          }).catch(() => {
            // 忽略无法发送消息的标签页
          });
        });
      });
      sendResponse({ status: 'success' });
    });
  }

  if (request.action === 'getResume') {
    chrome.storage.local.get('resumeData', (result) => {
      sendResponse({ data: result.resumeData });
    });
  }
});
