const enterprise_sso_details = {
  back_to_sso_connectors: '返回企業單一登入',
  page_title: '企業單一登入連接器詳細信息',
  readme_drawer_title: '企業單一登入',
  readme_drawer_subtitle: '設置企業單一登入連接器以啟用終端用戶單一登入',
  tab_experience: '單一登入體驗',
  tab_connection: '連接',
  tab_idp_initiated_auth: '身分提供者發起的單一登入',
  general_settings_title: '一般',
  general_settings_description:
    '配置終端用戶體驗及鏈接企業電子郵件域以啟用服務提供者發起的單一登入流程。',
  custom_branding_title: '顯示',
  custom_branding_description:
    '自定義在終端用戶單點登錄流程中顯示的名稱和圖標。 當為空時，將使用默認值。',
  email_domain_field_name: '企業郵箱域',
  email_domain_field_description:
    '使用此郵箱域的用戶可以使用單一登入進行身份驗證。 請驗證該域是否屬於企業。',
  email_domain_field_placeholder: '郵箱域',
  sync_profile_field_name: '將配置文件信息從身份提供者同步',
  sync_profile_option: {
    register_only: '僅在首次登錄時同步',
    each_sign_in: '每次登錄時始終同步',
  },
  connector_name_field_name: '連接器名稱',
  display_name_field_name: '顯示名稱',
  connector_logo_field_name: '顯示圖標',
  connector_logo_field_description: '每個圖像應小於500KB，僅支援SVG，PNG，JPG，JPEG。',
  branding_logo_context: '上傳圖標',
  branding_logo_error: '上傳圖標錯誤：{{error}}',
  branding_light_logo_context: '上傳淺色模式圖標',
  branding_light_logo_error: '上傳淺色模式圖標錯誤：{{error}}',
  branding_logo_field_name: '圖標',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: '上傳深色模式圖標',
  branding_dark_logo_error: '上傳深色模式圖標錯誤：{{error}}',
  branding_dark_logo_field_name: '圖標（深色模式）',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: '連接指南',
  enterprise_sso_deleted: '企業單一登入連接器已成功刪除',
  delete_confirm_modal_title: '刪除企業單一登入連接器',
  delete_confirm_modal_content: '你確定要刪除此企業連接器嗎？ 身份提供者的用戶將無法使用單點登錄。',
  upload_idp_metadata_title_saml: '上傳元數據',
  upload_idp_metadata_description_saml: '配置從身份提供者複製的元數據。',
  upload_idp_metadata_title_oidc: '上傳憑證',
  upload_idp_metadata_description_oidc:
    '配置從身份提供者複製的憑證和開放身分連接（OIDC）令牌信息。',
  upload_idp_metadata_button_text: '上傳元數據可延伸標記語言（XML）文件',
  upload_signing_certificate_button_text: '上傳簽名憑證文件',
  configure_domain_field_info_text: '添加電子郵件域以引導企業用戶到其身份提供者進行單點登錄。',
  email_domain_field_required: '需要填寫電子郵件域以啟用企業單一登入。',
  upload_saml_idp_metadata_info_text_url: '粘貼來自身份提供者的元數據網址以進行連接。',
  upload_saml_idp_metadata_info_text_xml: '粘貼來自身份提供者的元數據以進行連接。',
  upload_saml_idp_metadata_info_text_manual: '填寫來自身份提供者的元數據以進行連接。',
  upload_oidc_idp_info_text: '填寫來自身份提供者的信息以進行連接。',
  service_provider_property_title: '在身分提供者中配置',
  service_provider_property_description:
    '使用{{protocol}}在身份提供者中設置應用程序集成。 輸入Logto提供的詳細信息。',
  attribute_mapping_title: '屬性映射',
  attribute_mapping_description:
    '通過在身份提供者或Logto端配置用戶屬性映射來從身份提供者同步用戶配置文件。',
  saml_preview: {
    sign_on_url: '登錄網址',
    entity_id: '發行者',
    x509_certificate: '簽名憑證',
    certificate_content: '到期{{date}}',
  },
  oidc_preview: {
    authorization_endpoint: '授權端點',
    token_endpoint: '令牌端點',
    userinfo_endpoint: '用戶信息端點',
    jwks_uri: 'JSON Web 金鑰集（JWKS）端點',
    issuer: '發行者',
  },
  idp_initiated_auth_config: {
    card_title: '身分提供者發起的單一登入',
    card_description:
      '用戶通常會通過服務提供者發起的單一登入流程從你的應用開始身份驗證流程。除非絕對必要，否則不要啟用此功能。',
    enable_idp_initiated_sso: '啟用身分提供者發起的單一登入',
    enable_idp_initiated_sso_description:
      '允許企業用戶直接從身份提供者的門戶開始身份驗證流程。在啟用此功能之前，請了解潛在的安全風險。',
    default_application: '默認應用程序',
    default_application_tooltip: '身份驗證後用戶將被重定向到的目標應用程序。',
    empty_applications_error: '未找到應用程序。 請在<a>應用程序</a>部分添加一個。',
    empty_applications_placeholder: '沒有應用程序',
    authentication_type: '身份驗證類型',
    auto_authentication_disabled_title: '將用戶重定向至客戶端以進行服務提供者發起的單一登入',
    auto_authentication_disabled_description:
      '推薦。將用戶重定向至客戶端應用程序以啟動安全的服務提供者發起的開放身分連接（OIDC）身份驗證。這將防止跨網站請求偽造（CSRF）攻擊。',
    auto_authentication_enabled_title: '使用身分提供者發起的單一登入直接登錄',
    auto_authentication_enabled_description:
      '成功登錄後，用戶將被重定向到指定的重定向位址並附帶授權代碼（無狀態和PKCE驗證）。',
    auto_authentication_disabled_app: '針對傳統Web應用或單頁應用(SPA)',
    auto_authentication_enabled_app: '針對傳統Web應用',
    idp_initiated_auth_callback_uri: '客戶端回調位址',
    idp_initiated_auth_callback_uri_tooltip:
      '客戶端回調位址來啟動服務提供者發起的單一登入身份驗證流程。一個ssoConnectorId會被附加到位址作為查詢參數。（例如，https://your.domain/sso/callback?connectorId={{ssoConnectorId}}）',
    redirect_uri: '登錄後重定向位址',
    redirect_uri_tooltip:
      '在成功登錄後重定向用戶的位址。Logto將使用此位址作為授權請求中的開放身分連接（OIDC）重定向位址。為身分提供者發起的單一登入身份驗證流程使用專用位址以提高安全性。',
    empty_redirect_uris_error: '該應用程序尚未註冊重定向位址。請先添加一個。',
    redirect_uri_placeholder: '選擇登錄後重定向的位址',
    auth_params: '附加身份驗證參數',
    auth_params_tooltip:
      '授權請求中要傳遞的額外參數。預設情況下只會請求(openid profile)範圍，你可以在這裡指定額外範圍或一個專屬的狀態值。（例如，{ "scope": "organizations email", "state": "secret_state" }）',
  },
  trust_unverified_email: '信任未驗證的電子郵件',
  trust_unverified_email_label: '始終信任身份提供者返回的未驗證電子郵件地址',
  trust_unverified_email_tip:
    'Entra識別碼（OIDC）連接器不返回 `email_verified` 聲明，這意味著來自Azure的電子郵件地址無法保證已被驗證。預設情況下，Logto不會將未驗證的電子郵件地址同步到用戶配置文件。只有在你信任來自Entra識別碼目錄的所有電子郵件地址時才啟用此選項。',
  trust_unverified_email_tip_oidc:
    '開放身分連接（OIDC）連接器可能不會返回 `email_verified` 聲明，這意味著來自身份提供者的電子郵件地址不一定經過驗證。預設情況下，Logto不會將未驗證的電子郵件地址同步到用戶配置文件。只有在你信任來自身份提供者的所有電子郵件地址時才啟用此選項。',
  offline_access: {
    label: '刷新訪問令牌',
    description:
      '啟用Google `offline` 訪問以請求刷新令牌，允許你的應用在不重新授權用戶的情況下刷新訪問令牌。',
  },
};

export default Object.freeze(enterprise_sso_details);
