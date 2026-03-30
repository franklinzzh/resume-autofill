/**
 * 后台服务工作器
 * 管理扩展的后台任务和消息
 */

console.log('[Resume Autofill] Background script loaded');

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
  console.log('[Background] 收到消息:', request.action);

  if (request.action === 'saveResume') {
    chrome.storage.local.set({ resumeData: request.data }, () => {
      console.log('[Background] 简历已保存');
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
    return true; // 保持消息通道打开用于异步响应
  }

  if (request.action === 'getResume') {
    chrome.storage.local.get('resumeData', (result) => {
      console.log('[Background] 返回简历:', result.resumeData ? '有' : '无');
      sendResponse({ data: result.resumeData });
    });
    return true; // 保持消息通道打开用于异步响应
  }

  // 未知消息
  return false;
});
