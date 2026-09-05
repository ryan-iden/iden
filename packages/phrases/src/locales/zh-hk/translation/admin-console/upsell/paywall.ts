const paywall = {
  applications:
    '已達到 <planName/> 的{{count, number}}個應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  applications_other:
    '已達到 <planName/> 的{{count, number}}個應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  machine_to_machine_feature:
    '升級至<strong>Pro</strong>方案，以獲取額外的機器對機器應用程式和享受所有高級功能。如有疑問，請<a>聯繫我們</a>。',
  machine_to_machine:
    '已達到 <planName/> 的{{count, number}}個機器對機器應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  machine_to_machine_other:
    '已達到 <planName/> 的{{count, number}}個機器對機器應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  resources:
    '已達到 <planName/> 的{{count, number}}個介面資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
  resources_other:
    '已達到 <planName/> 的{{count, number}}個介面資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
  scopes_per_resource:
    '已達到 <planName/> 的{{count, number}}個介面資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
  scopes_per_resource_other:
    '已達到 <planName/> 的{{count, number}}個介面資源每個權限限制。立即升級以擴展。如需任何幫助,請<a>聯繫我們</a>。',
  custom_domain:
    '已達到 <planName/> 的 {{count, number}} 個自訂網域限制。升級到付費計劃以新增多個自訂網域和高級福利。如有任何問題,請隨時<a>聯絡我們</a>。',
  custom_domain_others:
    '已達到 <planName/> 的 {{count, number}} 個自訂網域限制。升級到付費計劃以新增多個自訂網域和高級福利。如有任何問題,請隨時<a>聯絡我們</a>。',
  social_connectors:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器。如需任何幫助，請<a>聯絡我們</a>。',
  social_connectors_other:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器。如需任何幫助，請<a>聯絡我們</a>。',
  standard_connectors_feature:
    '升級至<strong>Hobby</strong>或<strong>Pro</strong>計劃，使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器，無限制的社交連接器以及所有高級功能。如需任何協助，歡迎<a>聯絡我們</a>。',
  standard_connectors:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器。如需任何協助，請<a>聯繫我們</a>。',
  standard_connectors_other:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器。如需任何協助，請<a>聯繫我們</a>。',
  standard_connectors_pro:
    '已達到 <planName/> 的{{count, number}}個標準連接器限制。為滿足您團隊的需求，請升級至企業版計劃以獲取額外的社交連接器，並可以使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器。如需任何協助，歡迎<a>聯絡我們</a>。',
  standard_connectors_pro_other:
    '已達到 <planName/> 的{{count, number}}個標準連接器限制。為滿足您團隊的需求，請升級至企業版計劃以獲取額外的社交連接器，並可以使用開放身分連接（OIDC）、開放授權（OAuth） 2.0 和安全斷言標記語言（SAML）協議創建您自己的連接器。如需任何協助，歡迎<a>聯絡我們</a>。',
  roles: '升級計劃以添加其他角色和權限。如需任何協助，歡迎<a>聯絡我們</a>。',
  scopes_per_role:
    '已達到 <planName/> 的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何協助，歡迎<a>聯繫我們</a>。',
  scopes_per_role_other:
    '已達到 <planName/> 的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何協助，歡迎<a>聯繫我們</a>。',
  saml_applications:
    '額外的安全斷言標記語言（SAML）應用程式可在Logto企業版計劃中使用。如需要協助，請聯絡我們。',
  saml_applications_add_on:
    '升級到付費計劃以解鎖安全斷言標記語言（SAML）應用程式功能。如需任何協助，歡迎<a>聯絡我們</a>。',
  hooks:
    '已達到 <planName/> 的{{count, number}}個事件回呼限制。升級計劃以創建更多事件回呼。如需任何協助，歡迎<a>聯絡我們</a>。',
  hooks_other:
    '已達到 <planName/> 的{{count, number}}個事件回呼限制。升級計劃以創建更多事件回呼。如需任何協助，請<a>聯絡我們</a>。',
  mfa: '升級到付費計劃以解鎖多因素驗證以提高安全性。如果需要任何協助，請隨時<a>聯絡我們</a>。',
  organizations: '升級至付費計劃以解鎖組織。如需要任何協助，請隨時<a>聯絡我們</a>。',
  third_party_apps:
    '藉由升級至付費計劃，將Logto解鎖為第三方應用程式的身分提供者。如需任何協助，歡迎<a>聯絡我們</a>。',
  sso_connectors:
    '升級至付費計劃以解鎖企業單一登錄（單一登入）。如需要任何協助，歡迎<a>聯絡我們</a>。',
  tenant_members: '透過升級至付費計劃，解鎖協作功能。如需要任何協助，歡迎<a>聯絡我們</a>。',
  tenant_members_dev_plan:
    '您已達到 {{limit}} 的成員限制。釋放一位成員或撤回待定邀請以新增新成員。需要更多席位？歡迎隨時聯絡我們。',
  custom_jwt: {
    title: '新增自訂聲索',
    description:
      '升級至付費計劃以獲得自訂JavaScript物件表示法（JSON）網路權杖（JWT）功能和專業服務。如有任何問題，歡迎隨時<a>聯絡我們</a>。',
  },
  branding_customization: '升級計劃，透過 "隱藏Logto品牌" 與 "帶上你的介面" 功能全面掌控品牌體驗。',
  bring_your_ui: '升級至付費計劃，以使用您的自定義介面功能和享受高級福利。',
  security_features:
    '透過升級至Pro計劃解鎖高級安全功能。如有任何問題，請不要猶豫，<a>聯絡我們</a>。',
  collect_user_profile:
    '升級到付費計劃以解鎖在新用戶註冊期間收集更多用戶資料資訊的功能。如有任何問題，請不要猶豫 <a>聯絡我們</a>。',
  passkey_sign_in:
    '升級至付費計劃，以使用通行密鑰登入功能和高級權益。如有任何問題，請隨時 <a>聯絡我們</a>。',
};

export default Object.freeze(paywall);
