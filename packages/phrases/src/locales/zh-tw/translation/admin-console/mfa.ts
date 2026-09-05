const mfa = {
  title: '多因素身份驗證',
  description: '添加多因素身份驗證以提升你登錄體驗的安全性。',
  factors: '因素',
  multi_factors: '多因素',
  multi_factors_description: '用戶需要驗證啟用的其中一個因素以進行兩步驗證。',
  totp: '身份驗證應用',
  otp_description: '將Google身分驗證器等連接起來，以驗證一次性密碼。',
  webauthn: '通行金鑰',
  webauthn_description: '通過瀏覽器支持的方法進行驗證：生物識別、手機掃描或安全密鑰等。',
  webauthn_domain_tip:
    '網路身分驗證（WebAuthn）將公共密鑰綁定到特定域。修改服務域將阻止用戶通過現有通行證進行身份驗證。',
  backup_code: '備份代碼',
  backup_code_description: '在用戶設置任何多因素驗證方法後生成 10 個一次性備份代碼。',
  backup_code_setup_hint: '當用戶無法驗證上述多因素驗證因素時，使用備份選項。',
  backup_code_error_hint:
    '要使用備份代碼，你需要至少再添加一種多因素驗證方法以成功進行用戶身份驗證。',
  email_verification_code: '郵件驗證碼',
  email_verification_code_description: '連接郵件地址以接收和驗證驗證碼。',
  phone_verification_code: 'SMS驗證碼',
  phone_verification_code_description: '連接手機號碼以接收和驗證SMS驗證碼。',
  policy: '策略',
  policy_description: '設置登錄和註冊流程的多因素驗證策略。',
  two_step_sign_in_policy: '登錄時的雙步驗證策略',
  user_controlled: '用戶可以自行啟用或禁用多因素驗證',
  user_controlled_tip: '用戶可以在首次登錄或註冊時跳過多因素驗證設置，或在帳戶設置中啟用/禁用它。',
  mandatory: '用戶總是需要在登錄時使用多因素驗證',
  mandatory_tip: '用戶必須在首次登錄或註冊時設置多因素驗證，並在以後的所有登錄中使用它。',
  require_mfa: '需要多因素驗證',
  require_mfa_label:
    '啟用此功能可使雙步驗證成為訪問你的應用的必須步驟。如果禁用，用戶可以自行決定是否啟用多因素驗證。',
  require_mfa_optional: '可選多因素驗證：允許用戶自行選擇是否為其帳號啟用多因素驗證',
  require_mfa_adaptive:
    '自適應多因素驗證：僅在登入看似有風險時（例如新國家/長期未活動）才要求多因素驗證',
  require_mfa_mandatory: '強制多因素驗證：要求所有用戶在每次登入時完成多因素驗證',
  set_up_prompt: '多因素驗證設定提示',
  no_prompt: '不要求用戶設置多因素驗證',
  prompt_at_sign_in_and_sign_up: '在註冊期間提示用戶設置多因素驗證（可跳過，一次性提示）',
  prompt_only_at_sign_in: '在註冊後用戶的下一次登錄嘗試時提示設置多因素驗證（可跳過，一次性提示）',
  prompt_at_sign_in_and_sign_up_mandatory: '在註冊時要求用戶設置多因素驗證（不可跳過）',
  prompt_only_at_sign_in_mandatory: '在註冊後的下一次登錄嘗試時要求用戶設置多因素驗證（不可跳過）',
  set_up_organization_required_mfa_prompt: '組織啟用多因素驗證後的用戶多因素驗證設置提示',
  prompt_at_sign_in_non_skippable: '在用戶的下次登錄時要求設置多因素驗證（不可跳過）',
  email_primary_method_tip:
    '郵件驗證碼已經是你的主要登錄方式。為了維持安全性，不能重複用作多因素驗證。',
  phone_primary_method_tip:
    'SMS驗證碼已經是你的主要登錄方式。為了維持安全性，不能重複用作多因素驗證。',
  no_email_connector_warning:
    '尚未設定電子郵件連接器。在完成設定前，用戶無法使用電子郵件驗證碼進行多因素驗證。在「連接器」中<a>{{link}}</a>。',
  no_sms_connector_warning:
    '尚未設定SMS連接器。在完成設定前，用戶無法使用SMS驗證碼進行多因素驗證。在「連接器」中<a>{{link}}</a>。',
  no_email_connector_error:
    '沒有電子郵件連接器無法啟用電子郵件驗證碼多因素驗證。請先設定電子郵件連接器。',
  no_sms_connector_error: '沒有SMS連接器無法啟用SMS驗證碼多因素驗證。請先設定SMS連接器。',
  setup_link: '設定',
  trusted_device: {
    title: '受信任裝置',
    description: '讓受信任的瀏覽器在目前多因素驗證流程要求驗證時自動完成多因素驗證驗證。',
    enable_title: '啟用受信任裝置',
    enable_description: '允許使用者完成符合條件的多因素驗證因素驗證後信任此瀏覽器。',
    duration_title: '信任期限（天）',
    duration_error: '請輸入 {{min}} 到 {{max}} 之間的整數。',
    duration_note: '信任期限的變更只適用於之後加入的受信任裝置。',
    organization_allow_title: '允許受信任裝置',
    organization_allow_tip:
      '組織只能收緊租戶的受信任裝置策略；租戶策略關閉時，組織無法啟用此功能。',
    organization_allow_description: '允許此組織的成員使用受信任裝置完成驗證。',
    organization_global_disabled:
      '請先在租戶多因素驗證設定中啟用受信任裝置，再為此組織允許此功能。',
    management_description:
      '管理此使用者完成多因素驗證後信任的瀏覽器。移除後，該瀏覽器下次登入時需要再次完成多因素驗證。',
    management_hint: '最近的位置僅供參考。',
    management_empty: '此使用者沒有有效的受信任裝置。',
    management_deletion_confirmation:
      '確定要移除 {{name}} 嗎？該瀏覽器下次登入時需要再次完成多因素驗證。',
    management_removed: '受信任裝置已移除。',
  },
};

export default Object.freeze(mfa);
