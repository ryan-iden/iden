const applications = {
  page_title: '全部應用',
  title: '全部應用',
  subtitle:
    '建立流動應用程式、單頁應用程式、機器對機器應用程式或傳統網頁應用程式，並透過 Logto 進行身份驗證',
  subtitle_with_app_type: '為你的 {{name}} 應用程序設置Logto身份驗證',
  create_device_flow_description:
    '建立一個使用開放授權（OAuth） 2.0 裝置授權許可的原生應用程式，適用於輸入受限裝置或無頭應用程式。',
  create: '創建應用',
  create_third_party: '創建第三方應用程式',
  create_thrid_party_modal_title: '創建第三方應用（{{type}}）',
  application_name: '應用名稱',
  application_name_placeholder: '我的應用',
  application_description: '應用描述',
  application_description_placeholder: '請輸入應用描述',
  select_application_type: '選擇應用類型',
  no_application_type_selected: '你還沒有選擇應用類型',
  application_created: '應用創建成功。',
  tab: {
    my_applications: '我的應用',
    third_party_applications: '第三方應用程式',
  },
  app_id: '應用程式識別碼',
  type: {
    native: {
      title: '原生應用',
      subtitle: '在原生環境中運行的應用程序',
      description: '例如iOS app、Android app、桌面app、電視、CLI',
    },
    spa: {
      title: '單頁應用',
      subtitle: '在瀏覽器中運行並動態更新數據的應用程序',
      description: '例如React DOM app，Vue app',
    },
    traditional: {
      title: '傳統網頁應用',
      subtitle: '僅由Web服務器渲染和更新的應用程序',
      description: '例如Next.js, PHP',
    },
    machine_to_machine: {
      title: '機器對機器',
      subtitle: '直接與資源對話的應用程序（通常是服務）',
      description: '例如，後端服務',
    },
    protected: {
      title: '受保護應用程序',
      subtitle: '透過Logto保護的應用程序',
      description: 'N/A',
    },
    saml: {
      title: '安全斷言標記語言（SAML）應用',
      subtitle: '作為安全斷言標記語言（SAML）身分提供者連接器使用的應用程式',
      description: '例如安全斷言標記語言（SAML）',
    },
    third_party: {
      title: '第三方應用程序',
      subtitle: '作為第三方身分提供者連接器使用的應用程序',
      description: '例如開放身分連接（OIDC），安全斷言標記語言（SAML）',
    },
  },
  authorization_flow: {
    title: '授權流程',
    tooltip: '選擇應用程式的授權流程。一旦設定，將無法更改。',
    authorization_code: {
      title: '授權碼',
      description: '預設且最常見的授權類型。使用者將被重新導向到登入頁面以直接授權存取。',
    },
    device_flow: {
      title: '裝置授權流程',
      description:
        '適用於輸入受限的裝置或無介面應用程式（如電視、命令列介面）。使用者可在另一台裝置上輸入裝置碼或掃描二維碼完成登入。',
    },
  },
  placeholder_title: '選擇應用程式類型以繼續',
  placeholder_description:
    'Logto使用開放身分連接（OIDC）的應用程式實體來幫助識別您的應用程式、管理登錄和創建審核日誌等任務。',
  third_party_application_placeholder_description:
    '使用Logto作為身份提供者為第三方服務提供開放授權（OAuth）授權。 \n 包括一個內建的用戶同意螢幕以訪問資源。<a>了解更多</a>',
  dynamic_app: {
    title: '動態應用',
    subtitle: 'CIMD',
    description: '動態應用允許開放授權（OAuth）用戶端無需預先註冊即可接入。',
    settings_description:
      '動態應用允許開放授權（OAuth）用戶端無需預先註冊即可接入，並遵循用戶端識別碼中繼資料文件（CIMD）規範。',
    beta_notice: '動態應用目前處於測試階段。歡迎探索並 <ContactLink>分享您的意見</ContactLink>。',
    app_id_placeholder: '由每個用戶端動態提供',
    enable_confirm_modal: {
      title: '啟用動態用戶端接入？',
      content:
        '任何擁有有效公開超文字傳輸安全協定（HTTPS）用戶端識別碼網址的開放授權（OAuth）用戶端，都可以無需預先註冊即向該租戶發起授權。存取範圍仍受你設定的最大權限和用戶同意的限制。',
      beta_pricing_notice:
        '動態應用在測試版期間免費使用。測試版結束後可能會作為附加功能收費。屆時我們會提前通知你，你也可以隨時關閉它。',
    },
    enabled: '動態應用已成功啟用。',
    disable_confirm_modal: {
      title: '停用動態應用？',
      content:
        'CIMD用戶端將無法再發起新的授權請求。既有的授權記錄會保留，已簽發的存取權杖在到期前可能仍然有效。',
    },
    disabled: '動態應用已成功停用。',
    permissions: {
      user_title: '用戶',
      user_description: '選擇開放授權（OAuth）客戶端為存取特定用戶數據所需的權限。',
      grant_user_level_permissions: '授予用戶權限',
      organization_title: '組織',
      organization_description: '選擇開放授權（OAuth）客戶端為存取特定組織數據所需的權限。',
      grant_organization_level_permissions: '授予組織權限',
      permission_delete_confirm:
        '此操作將從動態應用中移除該權限，阻止開放授權（OAuth）客戶端就該權限請求用戶授權。是否確定要繼續？',
    },
  },
  guide: {
    third_party: {
      title: '整合第三方應用程式',
      description:
        '使用Logto作為身份提供者為第三方服務提供開放授權（OAuth）授權。包含用於安全資源訪問的預建用戶同意螢幕。<a>了解更多</a>',
    },
  },
};

export default Object.freeze(applications);
