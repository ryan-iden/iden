const enterprise_sso = {
  page_title: '企业单点登录',
  title: '企业单点登录',
  subtitle: '连接企业身份提供者并启用单点登录。',
  create: '添加企业连接器',
  col_connector_name: '连接器名称',
  col_type: '类型',
  col_email_domain: '电子邮件域',
  placeholder_title: '企业连接器',
  placeholder_description:
    'Logto提供了许多内置的企业身份提供者，与之连接，与此同时你可以使用安全断言标记语言（SAML）和开放身份连接（OIDC）协议创建自己的企业身份提供者。',
  create_modal: {
    title: '添加企业连接器',
    text_divider: '或者你可以通过标准协议自定义你的连接器。',
    connector_name_field_title: '连接器名称',
    connector_name_field_placeholder: '例如：公司名称 - 身份提供商名称',
    create_button_text: '创建连接器',
  },
  guide: {
    subtitle: '连接企业身份提供者的逐步指南。',
    finish_button_text: '继续',
  },
  basic_info: {
    title: '在身份提供商中配置你的服务',
    description:
      '在 {{name}} 身份提供者中通过安全断言标记语言（SAML） 2.0 创建一个新的应用集成。然后将以下值粘贴到其中。',
    saml: {
      acs_url_field_name: '断言消费者服务网址（回复网址）',
      audience_uri_field_name: '受众地址(服务提供商实体标识)',
      entity_id_field_name: '服务提供商实体标识',
      entity_id_field_tooltip:
        '服务提供商实体标识可以采用任何字符串格式，通常使用地址或网址形式作为标识符，但这不是必需的。',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
      sign_auth_request: '签名认证请求',
      sign_auth_request_tooltip:
        'Logto使用生成的证书对安全断言标记语言（SAML）认证请求进行签名。仅当你的身份提供者已配置为验证签名请求时才启用。',
      signing_certificate_field_name: '请求签名证书',
      signing_keys_empty: '尚未生成签名密钥。',
      generate_signing_key: '生成新密钥',
      signing_key_generated: '签名密钥已生成。',
      signing_key_activated: '签名密钥已启用。',
      signing_key_deactivated: '签名密钥已停用。',
      signing_key_deleted: '签名密钥已删除。',
      sign_auth_request_warning:
        '启用后，请在下方生成签名密钥，并将其证书注册到你的身份提供者（并在那里开启签名请求验证）。在证书注册完成之前，通过此连接登录将会失败。',
    },
    oidc: {
      redirect_uri_field_name: '重定向地址（回调网址）',
      redirect_uri_field_description:
        '重定向地址是在单点登录认证后用户被重定向到的地址。请将此地址添加到身份提供商的配置中。',
      redirect_uri_field_custom_domain_description:
        '如果你在Logto中使用多个<a>自定义域名</a>，务必将所有对应的回调地址都添加到身份提供商中，以确保单点登录在每个域名上都能正常工作。\n\n默认的Logto域名(*.logto.app)始终有效，只有在你也希望支持该域名下的单点登录时才需要包含它。',
    },
  },
  attribute_mapping: {
    title: '属性映射',
    description: '需要 `id` 和 `email` 来同步用户配置文件。在身份提供商中输入以下声明名称和值。',
    col_sp_claims: '服务提供商（Logto）的值',
    col_idp_claims: '身份提供者的声明名称',
    idp_claim_tooltip: '身份提供者的声明名称',
  },
  metadata: {
    title: '配置身份提供商元数据',
    description: '配置来自身份提供者的元数据',
    dropdown_trigger_text: '使用其他配置方法',
    dropdown_title: '选择你的配置方法',
    metadata_format_url: '输入元数据网址',
    metadata_format_xml: '上传元数据可扩展标记语言（XML）文件',
    metadata_format_manual: '手动输入元数据详细信息',
    saml: {
      metadata_url_field_name: '元数据网址',
      metadata_url_description: '动态地从元数据网址获取数据并更新证书。',
      metadata_xml_field_name: '身份提供商元数据可扩展标记语言（XML）文件',
      metadata_xml_uploader_text: '上传元数据可扩展标记语言（XML）文件',
      sign_in_endpoint_field_name: '登录网址',
      idp_entity_id_field_name: '身份提供商实体标识（发行者）',
      certificate_field_name: '签名证书',
      certificate_placeholder: '复制并粘贴x509 证书',
      certificate_required: '需要签名证书。',
    },
    oidc: {
      client_id_field_name: '客户端标识',
      client_secret_field_name: '客户端密钥',
      issuer_field_name: '发行者',
      scope_field_name: '范围',
      scope_field_placeholder: '输入范围（用空格分隔）',
    },
  },
};

export default Object.freeze(enterprise_sso);
