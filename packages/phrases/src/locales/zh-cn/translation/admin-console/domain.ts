const domain = {
  status: {
    connecting: '连接中...',
    in_use: '使用中',
    failed_to_connect: '连接失败',
  },
  update_endpoint_notice:
    '如果你想使用自定义域名，请不要忘记在应用程序中更新社交连接器回调地址和Logto终结点的域名。',
  error_hint: '请确保更新你的域名系统（DNS）记录。我们将继续每 {{value}} 秒检查一次。',
  custom: {
    custom_domain: '自定义域名',
    custom_domain_description: '通过使用自定义域名来提高品牌形象。此域名将用于你的登录体验。',
    custom_domain_field: '自定义域名',
    custom_domain_placeholder: 'auth.domain.com',
    add_custom_domain_field: '添加自定义域名',
    custom_domains_field: '自定义域名',
    add_domain: '添加域名',
    invalid_domain_format: '请提供一个有效的域名网址，至少有三个部分，例如 "auth.domain.com."',
    verify_domain: '验证域名',
    enable_ssl: '启用安全套接层（SSL）',
    checking_dns_tip:
      '域名系统（DNS）记录已配置，请等待最长 24 小时，以使变更生效。在域名是否有效期间，你可以离开此界面。',
    enable_ssl_tip:
      '启用安全套接层（SSL）将自动运行，可能需要最长 24 小时。在运行期间，你可以离开此界面。',
    generating_dns_records: '正在生成域名系统（DNS）记录...',
    add_dns_records: '请将以下域名系统（DNS）记录添加到你的域名系统（DNS）服务提供商。',
    dns_table: {
      type_field: '类型',
      name_field: '名称',
      value_field: '值',
    },
    deletion: {
      delete_domain: '删除域名',
      reminder: '删除自定义域名',
      description: '你确定要删除此自定义域名吗？',
      in_used_description: '你确定要删除此自定义域名 "<span>{{domain}}</span>" 吗？',
      in_used_tip:
        '如果你之前已在社交连接器提供商或应用程序终结点中设置了此自定义域名，则需要先将地址修改为Logto默认域名 "<span>{{domain}}</span>"。这对于社交登录按钮的正常工作是必要的。',
      deleted: '自定义域名删除成功！',
    },
    config_custom_domain_description:
      '配置自定义域名以设置以下功能：应用、社交连接器和企业连接器。',
    verification_files: {
      title: '域名验证文件',
      description:
        '通过此自定义域名提供小型文本或JavaScript对象表示法（JSON）文件，用于向第三方服务验证域名所有权。',
      add: '添加验证文件',
      empty: '尚未配置验证文件。',
      path: '文件路径',
      content_type: '内容类型',
      content_type_text: '纯文本',
      content_type_json: 'JavaScript对象表示法（JSON）',
      content: '文件内容',
      content_placeholder: '粘贴验证文件的准确内容',
      required: '此字段为必填项。',
      invalid_path:
        '请在域名根目录使用带扩展名的文件名，或使用 /.well-known/ 下的路径。仅支持字母、数字、点、连字符和下划线。',
      duplicate_path: '已有验证文件使用此路径。',
      content_too_long: '文件内容不得超过 16,384 个字符。',
      invalid_json: '请输入有效的JavaScript对象表示法（JSON）内容。',
    },
  },
  default: {
    default_domain: '默认域名',
    default_domain_description:
      'Logto提供了一个预配置的默认域名，无需任何其他设置即可使用。即使你启用了自定义域名，此默认域名也可作为备用选项。',
    default_domain_field: 'Logto默认域名',
  },
  custom_endpoint_note: '你可以根据需要自定义这些端点的域名。选择 "{{custom}}" 或 "{{default}}"。',
  custom_social_callback_url_note:
    '你可以根据需要自定义此地址的域名，以匹配你的应用程序端点。选择 "{{custom}}" 或 "{{default}}"。',
  custom_acs_url_note:
    '您可以根据需要自定义此地址的域名，以匹配您的身份提供方断言使用者服务网址。选择 "{{custom}}" 或 "{{default}}"。',
  switch_custom_domain_tip: '切换域名以查看对应的端点。通过 <a>自定义域名</a> 添加更多域名。',
  switch_saml_app_domain_tip:
    '切换域名以查看对应的网址。对于安全断言标记语言（SAML）协议，元数据网址可以托管在任意可访问的域名上。但所选域名决定服务提供商用于重定向终端用户进行认证的单点登录服务网址，这会影响登录体验与网址的可见性。',
  switch_saml_connector_domain_tip:
    '切换域名以查看对应的网址。所选域名决定你的ACS网址，这会影响用户在单点登录登录后被重定向的位置。请选择与应用期望重定向行为一致的域名。',
};

export default Object.freeze(domain);
