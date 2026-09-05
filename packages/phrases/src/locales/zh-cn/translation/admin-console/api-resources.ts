const api_resources = {
  page_title: '接口资源',
  title: '接口资源',
  subtitle: '定义可以从已授权的应用程序中使用的接口。',
  create: '创建接口资源',
  api_name: '接口名称',
  api_name_placeholder: '输入接口名称',
  api_identifier: '接口标识符',
  api_identifier_placeholder: 'https://your-api-identifier',
  api_identifier_tip:
    '接口资源的唯一标识符。它必须是绝对地址，且不能包含片段（fragment，#）。等价于开放授权（OAuth）2.0 中的<a>资源参数</a>。',
  default_api: '默认接口',
  default_api_label:
    '每个租户只能设置零个或一个默认接口。指定默认接口后，可以在认证请求中省略资源参数。后续令牌交换将默认使用该接口作为受众（Audience），从而签发 JSON Web 令牌（JWT）。<a>了解更多</a>',
  api_resource_created: '接口资源 {{name}} 已成功创建。',
  invalid_resource_indicator_format: '接口标识符必须是有效的绝对地址。',
};

export default Object.freeze(api_resources);
