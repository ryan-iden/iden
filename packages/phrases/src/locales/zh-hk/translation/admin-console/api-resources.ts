const api_resources = {
  page_title: '介面資源',
  title: '介面資源',
  subtitle: '定義可以從已授權的應用程序中使用的介面。',
  create: '創建介面資源',
  api_name: '介面名稱',
  api_name_placeholder: '輸入介面名稱',
  api_identifier: '介面描述符',
  api_identifier_placeholder: 'https://your-api-identifier',
  api_identifier_tip:
    '介面資源的唯一識別碼。它必須是絕對位址，且不能包含片段（fragment，#）。等價於開放授權（OAuth）2.0 中的<a>資源參數</a>。',
  default_api: '預設的介面',
  default_api_label:
    '每個租戶只能設定零個或一個預設介面。指定預設介面後，可以在授權請求中省略資源參數。後續權杖交換將預設使用該介面作為受眾（Audience），從而簽發 JSON Web 權杖（JWT）。<a>了解更多</a>',
  api_resource_created: '介面資源 {{name}} 已成功建立。',
  invalid_resource_indicator_format: '介面描述符必須是有效的絕對位址。',
};

export default Object.freeze(api_resources);
