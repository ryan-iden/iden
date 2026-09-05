const webhook_details = {
  page_title: '事件回呼詳細資料',
  back_to_webhooks: '返回事件回呼',
  not_in_use: '未啟用',
  success_rate: '成功率',
  requests: '24 小時內收到 {{value, number}} 個請求',
  disable_webhook: '停用事件回呼',
  disable_reminder:
    '確定要重新啟用此事件回呼？重新啟用後，不會對端點網址發送超文字傳輸協定（HTTP）請求。',
  webhook_disabled: '事件回呼已停用。',
  webhook_reactivated: '事件回呼已重新啟用。',
  reactivate_webhook: '重新啟用事件回呼',
  delete_webhook: '刪除事件回呼',
  deletion_reminder: '您正在刪除此事件回呼。刪除後，不會對端點網址發送超文字傳輸協定（HTTP）請求。',
  deleted: '事件回呼已成功刪除。',
  settings_tab: '設置',
  recent_requests_tab: '最新請求（24h）',
  settings: {
    settings: '設置',
    settings_description:
      '事件回呼允許您即時接收特定事件的更新，通過將POST請求發送到您的端點網址。這使您能夠根據收到的新信息立即採取行動。',
    events: '事件',
    events_description: '選擇Logto將發送POST請求的觸發事件。',
    name: '名稱',
    endpoint_url: '端點網址',
    signing_key: '簽名密鑰',
    signing_key_tip: '添加Logto提供的秘密金鑰作為請求標題至您的端點，以確保事件回呼負載的真實性。',
    regenerate: '重新生成',
    regenerate_key_title: '重新生成簽名密鑰',
    regenerate_key_reminder:
      '是否確定要修改簽名密鑰？重新生成後立即生效。請記得同步在端點中修改簽名密鑰。',
    regenerated: '簽名密鑰已重新生成。',
    custom_headers: '自定義標頭',
    custom_headers_tip:
      '您可以選擇添加自定義標頭到事件回呼的負載，提供有關事件的更多上下文或元數據。',
    key_duplicated_error: 'Key不能重複。',
    key_missing_error: '必須填寫Key。',
    value_missing_error: '未填寫值。',
    invalid_key_error: 'Key無效',
    invalid_value_error: '值無效',
    test: '測試',
    test_webhook: '測試您的事件回呼',
    test_webhook_description:
      '配置事件回呼，並使用每個選定事件的負載示例進行測試，以驗證正確接收和處理。',
    send_test_payload: '發送測試負載',
    test_result: {
      endpoint_url: '端點網址：{{url}}',
      message: '消息：{{message}}',
      response_status: '響應狀態：{{status, number}}',
      response_body: '響應主體：{{body}}',
      request_time: '請求時間：{{time}}',
      test_success: '向端點發起的事件回呼測試成功。',
    },
  },
};

export default Object.freeze(webhook_details);
