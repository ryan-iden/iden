const webhooks = {
  page_title: '事件回呼',
  title: '事件回呼',
  subtitle: '創建事件回呼，輕鬆地接收有關特定事件的實時更新。',
  create: '創建事件回呼',
  schemas: {
    interaction: '用戶互動',
    user: '用戶',
    trusted_device: '受信任裝置',
    organization: '組織',
    role: '角色',
    scope: '權限',
    organization_role: '組織角色',
    organization_scope: '組織權限',
    security: '安全',
  },
  table: {
    name: '名稱',
    events: '事件',
    success_rate: '成功率（24h）',
    requests: '請求（24h）',
  },
  placeholder: {
    title: '事件回呼',
    description:
      '創建事件回呼以通過POST請求向您的端點網址接收實時更新。了解詳情並針對“創建帳戶”、“登錄”和“重置密碼”等事件立即採取行動。',
    create_webhook: '創建事件回呼',
  },
  create_form: {
    title: '創建事件回呼',
    subtitle: '添加事件回呼以向endpoint網址發送POST請求，將詳細信息推送到任何用戶事件。',
    events: '事件',
    events_description: '選擇需要Logto發送POST請求的觸發事件。',
    name: '名稱',
    name_placeholder: '輸入事件回呼名稱',
    endpoint_url: 'Endpoint網址',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: '輸入您的端點網址，當事件發生時向其發送事件回呼的有效負載。',
    create_webhook: '創建事件回呼',
    missing_event_error: '您必須至少選擇一個事件。',
  },
  webhook_created: '事件回呼 {{name}} 成功創建。',
};

export default Object.freeze(webhooks);
