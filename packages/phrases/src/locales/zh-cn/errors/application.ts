const application = {
  invalid_type: '只有机器对机器应用程序可以有关联角色。',
  role_exists: '角色标识 {{roleId}} 已添加到此应用程序。',
  invalid_role_type: '无法将用户类型角色分配给机器对机器应用程序。',
  invalid_third_party_application_type:
    '只有传统网页应用、单页应用和原生应用可以标记为第三方应用。',
  third_party_application_only: '该功能仅适用于第三方应用程序。',
  third_party_application_cannot_enable_token_exchange: '第三方应用程序不允许启用令牌交换。',
  user_consent_scopes_not_found: '无效的用户同意范围。',
  consent_management_api_scopes_not_allowed: '管理接口范围不允许。',
  device_flow_native_only: '设备授权流程仅适用于原生应用。',
  device_flow_not_changeable: '设备授权流程在应用创建后不可更改。',
  protected_app_metadata_is_required: '需要保护的应用程序元数据。',
  protected_app_not_configured: '受保护的应用程序提供程序未配置。 此功能不适用于开源版本。',
  cloudflare_unknown_error: '请求Cloudflare接口时发生未知错误',
  protected_application_only: '该功能仅适用于受保护的应用程序。',
  protected_application_misconfigured: '受保护的应用程序配置不正确。',
  protected_application_subdomain_exists: '受保护的应用程序子域名已在使用中。',
  invalid_subdomain: '无效的子域名。',
  custom_domain_not_found: '未找到自定义域。',
  should_delete_custom_domains_first: '应先删除自定义域。',
  no_legacy_secret_found: '该应用程序没有旧版密钥。',
  secret_name_exists: '密钥名称已存在。',
  sync_application_secret_failed: '同步应用程序密钥失败。',
  saml: {
    use_saml_app_api:
      '使用 `[METHOD] /saml-applications(/.*)?` 接口操作安全断言标记语言（SAML）应用。',
    saml_application_only: '该接口仅适用于安全断言标记语言（SAML）应用。',
    reach_oss_limit: '你不能创建更多安全断言标记语言（SAML）应用，因为已达到 {{limit}} 的限制。',
    acs_url_binding_not_supported: '仅支持使用 HTTP POST 绑定接收安全断言标记语言（SAML）断言。',
    acs_url_scheme_not_supported:
      '断言消费者服务（ACS）网址仅支持超文本传输协议（HTTP）和超文本传输安全协议（HTTPS）协议。',
    can_not_delete_active_secret: '不能删除活动密钥。',
    no_active_secret: '未找到活动密钥。',
    entity_id_required: '生成元数据需要实体标识。',
    name_id_format_required: '需要名称标识格式。',
    unsupported_name_id_format: '不支持的名称标识格式。',
    missing_email_address: '用户没有电子邮件地址。',
    email_address_unverified: '用户电子邮件地址未验证。',
    invalid_certificate_pem_format: '无效的隐私增强邮件格式（PEM）证书格式',
    acs_url_required: '需要断言消费服务网址。',
    private_key_required: '需要私钥。',
    certificate_required: '需要证书。',
    invalid_saml_request: '无效的安全断言标记语言（SAML）认证请求。',
    auth_request_issuer_not_match:
      '安全断言标记语言（SAML）认证请求的发行者与服务提供者实体标识不匹配。',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      '在浏览器存储数据中未找到服务提供者发起的安全断言标记语言（SAML）单点登录会话标识。',
    sp_initiated_saml_sso_session_not_found:
      '未找到服务提供者发起的安全断言标记语言（SAML）单点登录会话。',
    state_mismatch: '`state` 不匹配。',
  },
};

export default Object.freeze(application);
