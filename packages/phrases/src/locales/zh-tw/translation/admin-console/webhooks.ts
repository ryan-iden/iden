const webhooks = {
  page_title: '事件回呼',
  title: '事件回呼',
  subtitle: '創建事件回呼以輕鬆收到特定事件的即時更新。',
  create: '創建事件回呼',
  schemas: {
    interaction: '使用者互動',
    user: '使用者',
    trusted_device: '受信任裝置',
    organization: '組織',
    role: '角色',
    scope: '權限',
    organization_role: '組織角色',
    organization_scope: '組織權限',
    security: '安全性',
  },
  table: {
    name: '名稱',
    events: '事件',
    success_rate: '成功率(24h)',
    requests: '請求數量(24h)',
  },
  placeholder: {
    title: '事件回呼',
    description:
      '創建事件回呼以收到通過POST請求發送到您的端點網址的即時更新。保持資訊，對「創建帳戶」「登錄」和「重置密碼」等事件立即採取行動。',
    create_webhook: '創建事件回呼',
  },
  create_form: {
    title: '創建事件回呼',
    subtitle: '添加事件回呼以發送POST請求到端點網址，包含任何使用者事件的詳細資訊。',
    events: '事件',
    events_description: '選擇Logto將發送POST請求的觸發事件。',
    name: '名稱',
    name_placeholder: '輸入事件回呼名稱',
    endpoint_url: '端點網址',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: '輸入您的端點網址，當事件發生時會將事件回呼的載荷發送到該網址。',
    create_webhook: '創建事件回呼',
    missing_event_error: '您需要選擇至少一個事件。',
  },
  webhook_created: '事件回呼 {{name}} 已成功創建。',
};

export default Object.freeze(webhooks);
