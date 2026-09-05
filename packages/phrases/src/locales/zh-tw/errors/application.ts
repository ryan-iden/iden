const application = {
  invalid_type: '僅允許機器對機器應用程式附加角色。',
  role_exists: '該角色識別碼 {{roleId}} 已被添加至此應用程式。',
  invalid_role_type: '無法將使用者類型的角色指派給機器對機器應用程式。',
  invalid_third_party_application_type:
    '僅傳統網頁應用程式、單頁應用程式和原生應用程式可以標記為第三方應用程式。',
  third_party_application_only: '該功能僅適用於第三方應用程式。',
  third_party_application_cannot_enable_token_exchange: '第三方應用程式不允許啟用權杖交換。',
  user_consent_scopes_not_found: '無效的使用者同意範圍。',
  consent_management_api_scopes_not_allowed: '管理介面範圍不被允許。',
  device_flow_native_only: '裝置授權流程僅適用於原生應用。',
  device_flow_not_changeable: '裝置授權流程在應用建立後不可更改。',
  protected_app_metadata_is_required: '需要保護應用程式元數據。',
  protected_app_not_configured: '保護應用程式提供者未配置。此功能不適用於開源版本。',
  cloudflare_unknown_error: '在請求Cloudflare介面時發生未知錯誤',
  protected_application_only: '該功能僅適用於受保護的應用程式。',
  protected_application_misconfigured: '受保護的應用程式配置錯誤。',
  protected_application_subdomain_exists: '受保護應用程式的子域名已被使用。',
  invalid_subdomain: '無效的子域名。',
  custom_domain_not_found: '找不到自訂域名。',
  should_delete_custom_domains_first: '應先刪除自訂域名。',
  no_legacy_secret_found: '該應用程式沒有傳統秘鑰。',
  secret_name_exists: '秘鑰名稱已存在。',
  sync_application_secret_failed: '同步應用程式秘鑰失敗。',
  saml: {
    use_saml_app_api:
      '使用 `[METHOD] /saml-applications(/.*)?` 介面操作安全斷言標記語言（SAML）應用程式。',
    saml_application_only: '該介面僅適用於安全斷言標記語言（SAML）應用程式。',
    reach_oss_limit:
      '由於已達到 {{limit}} 的限制，你無法創建更多的安全斷言標記語言（SAML）應用程式。',
    acs_url_binding_not_supported: '僅支援使用 HTTP POST 綁定接收安全斷言標記語言（SAML）宣告。',
    acs_url_scheme_not_supported:
      '斷言消費者服務（ACS）網址僅支援超文字傳輸協定（HTTP）和超文字傳輸安全協定（HTTPS）協定。',
    can_not_delete_active_secret: '無法刪除活躍的秘鑰。',
    no_active_secret: '找不到活躍的秘鑰。',
    entity_id_required: '需要提供實體識別碼來生成元數據。',
    name_id_format_required: '需要提供名稱識別碼格式。',
    unsupported_name_id_format: '不支持的名稱識別碼格式。',
    missing_email_address: '使用者沒有電子郵件地址。',
    email_address_unverified: '使用者的電子郵件地址未驗證。',
    invalid_certificate_pem_format: '無效的隱私增強郵件格式（PEM）證書格式',
    acs_url_required: '需要提供聲明承載者服務網址。',
    private_key_required: '需要提供私鑰。',
    certificate_required: '需要提供證書。',
    invalid_saml_request: '無效的安全斷言標記語言（SAML）驗證請求。',
    auth_request_issuer_not_match:
      '安全斷言標記語言（SAML）驗證請求的發行者與服務提供者的實體識別碼不匹配。',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      '在瀏覽器儲存資料中找不到服務提供者發起的安全斷言標記語言（SAML）單點登入會話識別碼。',
    sp_initiated_saml_sso_session_not_found:
      '找不到服務提供者發起的安全斷言標記語言（SAML）單點登入會話。',
    state_mismatch: '`state` 不匹配。',
  },
};

export default Object.freeze(application);
