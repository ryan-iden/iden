const webhooks = {
  page_title: '事件回调',
  title: '事件回调',
  subtitle: '创建事件回调以轻松接收有关特定事件的实时更新。',
  create: '创建事件回调',
  schemas: {
    interaction: '用户交互',
    user: '用户',
    trusted_device: '可信设备',
    organization: '组织',
    role: '角色',
    scope: '权限',
    organization_role: '组织角色',
    organization_scope: '组织权限',
    security: '安全',
  },
  table: {
    name: '名称',
    events: '事件',
    success_rate: '成功率（24小时）',
    requests: '请求数（24小时）',
  },
  placeholder: {
    title: '事件回调',
    description:
      '创建一个事件回调以通过POST请求将实时更新发送到您的端点网址。了解并立即采取有关“创建账户”、“登录”和“重置密码”等事件的操作。',
    create_webhook: '创建事件回调',
  },
  create_form: {
    title: '创建事件回调',
    subtitle: '添加事件回调以将POST请求发送到端点网址，并附带任何用户事件的详细信息。',
    events: '事件',
    events_description: '选择触发事件，Logto将发送POST请求。',
    name: '名称',
    name_placeholder: '输入事件回调名称',
    endpoint_url: '端点网址',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: '输入您的端点网址，在事件发生时事件回调的数据将被发送到该网址。',
    create_webhook: '创建事件回调',
    missing_event_error: '您必须至少选择一个事件。',
  },
  webhook_created: '事件回调 {{name}} 已成功创建。',
};

export default Object.freeze(webhooks);
