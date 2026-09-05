const webhook_details = {
  page_title: '事件回调详情',
  back_to_webhooks: '返回事件回调',
  not_in_use: '未使用',
  success_rate: '成功率',
  requests: '24 小时内请求次数：{{value, number}}',
  disable_webhook: '禁用事件回调',
  disable_reminder:
    '是否确定重新激活此事件回调？重新激活后将不会向端点网址发送超文本传输协议（HTTP）请求。',
  webhook_disabled: '事件回调已被禁用。',
  webhook_reactivated: '事件回调已经重新激活。',
  reactivate_webhook: '重新激活事件回调',
  delete_webhook: '删除事件回调',
  deletion_reminder:
    '您正在删除此事件回调。删除后，将不会向端点网址发送超文本传输协议（HTTP）请求。',
  deleted: '事件回调已成功删除。',
  settings_tab: '设置',
  recent_requests_tab: '最近请求（24小时）',
  settings: {
    settings: '设置',
    settings_description:
      '事件回调允许您通过向端点网址发送POST请求，实时接收特定事件的更新。这使您可以根据接收到的新信息立即采取行动。',
    events: '事件',
    events_description: '选择Logto将发送POST请求的触发事件。',
    name: '名称',
    endpoint_url: '端点网址',
    signing_key: '签名密钥',
    signing_key_tip:
      '将由Logto提供的密钥作为请求标头添加到您的端点中，以确保事件回调负载的真实性。',
    regenerate: '重新生成',
    regenerate_key_title: '重新生成签名密钥',
    regenerate_key_reminder:
      '是否确定要修改签名密钥？重新生成后将立即生效。请在您的端点中同步修改签名密钥。',
    regenerated: '签名密钥已重新生成。',
    custom_headers: '自定义标头',
    custom_headers_tip:
      '选择性地，您可以向事件回调负载添加自定义标头，以提供事件的其他上下文或元数据。',
    key_duplicated_error: 'Key不能重复。',
    key_missing_error: '必须填写Key。',
    value_missing_error: '必须填写值。',
    invalid_key_error: ' Key无效',
    invalid_value_error: '值无效',
    test: '测试',
    test_webhook: '测试您的事件回调',
    test_webhook_description:
      '配置事件回调，并使用每个选定事件的负载示例进行测试，以验证正确的接收和处理。',
    send_test_payload: '发送测试负载',
    test_result: {
      endpoint_url: '端点网址：{{url}}',
      message: '消息：{{message}}',
      response_status: '响应状态：{{status, number}}',
      response_body: '响应主体：{{body}}',
      request_time: '请求时间：{{time}}',
      test_success: '向端点发起的事件回调测试成功。',
    },
  },
};

export default Object.freeze(webhook_details);
