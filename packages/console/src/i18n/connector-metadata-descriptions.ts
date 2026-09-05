/** Localized explanations for built-in connector configuration fields. */
export const connectorMetadataDescriptions: ReadonlyArray<readonly [string, string, string]> = [
  [
    'Whether to disable Twilio built-in risk check. Enabled by default. More details: https://www.twilio.com/docs/messaging/api/message-resource',
    '是否禁用 Twilio 内置风险检查。风险检查默认启用。详情：https://www.twilio.com/docs/messaging/api/message-resource',
    '是否停用 Twilio 內建風險檢查。風險檢查預設啟用。詳情：https://www.twilio.com/docs/messaging/api/message-resource',
  ],
  [
    'The message to be displayed when the phone number is not supported. If left empty, no error will be returned.',
    '手机号码不受支持时显示的提示。留空则不返回错误。',
    '手機號碼不受支援時顯示的提示。留空則不傳回錯誤。',
  ],
  [
    'Custom headers to be added to original email headers when sending messages. Both keys and values should be string-typed.',
    '发送邮件时，在原始邮件头中加入这些自定义字段。键和值都必须为字符串。',
    '寄送郵件時，在原始郵件標頭中加入這些自訂欄位。鍵和值都必須為字串。',
  ],
  [
    'The application-defined unique identifier that is the intended audience of the SAML assertion. This is most often the SP Entity ID of your application.',
    '应用定义的唯一标识符，表示安全断言标记语言（SAML）断言的预期受众。通常是应用的服务提供商实体标识符。',
    '應用程式定義的唯一識別碼，表示安全性宣告標記語言（SAML）宣告的預期對象。通常是應用程式的服務供應商實體識別碼。',
  ],
  [
    'The certificate is provided by the IdP, and will be used to validate the signature of the SAML assertion.',
    '身份提供商提供的证书，用于验证安全断言标记语言（SAML）断言的签名。',
    '身分提供者提供的憑證，用於驗證安全性宣告標記語言（SAML）宣告的簽章。',
  ],
  [
    'Copy and paste the unique Assertion Consumer Service URL (ACS URL) into the {{Connector Name}} provider configuration. It will take effect after the connector is created.',
    '将唯一的断言消费服务地址复制到 {{Connector Name}} 提供商的配置中。创建连接器后生效。',
    '將唯一的宣告取用服務位址複製到 {{Connector Name}} 供應商的設定中。建立連接器後生效。',
  ],
  [
    'Encrypt the SAML assertion before sending it to the SP. This is optional and depends on your IdP configuration.',
    '向服务提供商发送前加密安全断言标记语言（SAML）断言。此项可选，取决于身份提供商的配置。',
    '向服務供應商傳送前加密安全性宣告標記語言（SAML）宣告。此項選填，取決於身分提供者的設定。',
  ],
  [
    "Identifies the SAML processing rules and constraints for the assertion's subject statement. Use the default value of 'Unspecified' unless the application explicitly requires a specific format.",
    "指定安全断言标记语言（SAML）主体声明的处理规则和约束。除非应用明确要求特定格式，否则使用默认值 'Unspecified'。",
    "指定安全性宣告標記語言（SAML）主體陳述的處理規則和限制。除非應用程式明確要求特定格式，否則使用預設值 'Unspecified'。",
  ],
  [
    'Copy a current gift signature from your Aliyun Message Authentication Service console (号码认证 → 短信认证参数配置 → 赠送签名配置).',
    '从阿里云号码认证服务控制台复制当前的赠送签名（号码认证 → 短信认证参数配置 → 赠送签名配置）。',
    '從阿里雲號碼驗證服務主控台複製目前的贈送簽章（號碼驗證 → 簡訊驗證參數設定 → 贈送簽章設定）。',
  ],
  [
    'Use system-provided template codes: 100001 (SignIn/Register/Generic), 100002 (Change Phone), 100003 (Reset Password), 100004 (Bind Phone), 100005 (Verify Phone).',
    '使用系统提供的模板编号：100001（登录／注册／通用）、100002（更换手机号）、100003（重置密码）、100004（绑定手机号）、100005（验证手机号）。',
    '使用系統提供的範本編號：100001（登入／註冊／通用）、100002（更換手機號碼）、100003（重設密碼）、100004（綁定手機號碼）、100005（驗證手機號碼）。',
  ],
  [
    'Whether to accept string-typed boolean claims. For standard OIDC protocol, some claims such as `email_verified` and `phone_verified` are boolean-typed, but some providers may return them as string-typed. Enabling this option will convert string-typed boolean claims to boolean-typed.',
    '是否接受字符串类型的布尔声明。按照开放身份连接（OIDC）协议，`email_verified` 和 `phone_verified` 等声明应为布尔类型，但部分提供商会返回字符串。启用后会将这些字符串转换为布尔值。',
    '是否接受字串類型的布林宣告。按照開放身分連接（OIDC）協定，`email_verified` 和 `phone_verified` 等宣告應為布林類型，但部分供應商會傳回字串。啟用後會將這些字串轉換為布林值。',
  ],
  [
    'Whether to trust the `email` claim even when `email_verified` is missing or false. Enable this only if you trust the provider to supply verified emails.',
    '即使 `email_verified` 缺失或为假，是否仍信任 `email` 声明。仅在信任提供商会提供已验证邮箱时启用。',
    '即使 `email_verified` 缺少或為假，是否仍信任 `email` 宣告。僅在信任供應商會提供已驗證電子郵件時啟用。',
  ],
  [
    "Some OIDC identity providers don't return the `email_verified` claim, so emails may be unverified. Logto won’t sync unverified email to the user profile by default. Enable this only if you fully trust the identity provider's email validation.",
    '部分开放身份连接（OIDC）身份提供商不返回 `email_verified` 声明，因此邮箱可能未经验证。系统默认不会将未验证的邮箱同步到用户资料。仅在完全信任身份提供商的邮箱验证时启用。',
    '部分開放身分連接（OIDC）身分提供者不傳回 `email_verified` 宣告，因此電子郵件可能未經驗證。系統預設不會將未驗證的電子郵件同步到使用者資料。僅在完全信任身分提供者的電子郵件驗證時啟用。',
  ],
  [
    'Enable Google `offline` access to request a refresh token, allowing your app to refresh the access token without user re-authorization. (Note: "consent" prompt is required)',
    '启用 Google `offline` 访问以请求刷新令牌，让应用无需用户重新授权即可刷新访问令牌。（注意：需要 "consent" 提示。）',
    '啟用 Google `offline` 存取以請求更新權杖，讓應用程式無須使用者重新授權即可更新存取權杖。（注意：需要 "consent" 提示。）',
  ],
  [
    "When this configuration is enabled, the connector will assume by default that all phone numbers include a valid region code and rely on this to determine whether the phone number belongs to mainland China. If your users' phone numbers do not include a region code due to historical reasons, their sign-in processes may be affected. Please enable this setting with caution.",
    '启用后，连接器会默认所有手机号都包含有效地区代码，并据此判断号码是否属于中国大陆。如果用户的历史手机号未包含地区代码，登录可能受到影响。请谨慎启用。',
    '啟用後，連接器會預設所有手機號碼都包含有效地區代碼，並據此判斷號碼是否屬於中國大陸。如果使用者的歷史手機號碼未包含地區代碼，登入可能受到影響。請謹慎啟用。',
  ],
  [
    'The authorization header to be sent with the request, you can verify the value in your server.',
    '随请求发送的授权请求头，可在服务器端验证其值。',
    '隨請求傳送的授權請求標頭，可在伺服器端驗證其值。',
  ],
  [
    "`openid` is required to allow OIDC and it's always added to the scopes if not present, `profile` is required to get user's profile information and `email` is required to get user's email address. These scopes can be used individually or in combination; if no scopes are specified, `openid` will be used by default.",
    '开放身份连接（OIDC）需要 `openid`，未指定时会自动加入。获取用户资料需要 `profile`，获取邮箱需要 `email`。这些作用域可单独或组合使用；未指定时默认使用 `openid`。',
    '開放身分連接（OIDC）需要 `openid`，未指定時會自動加入。取得使用者資料需要 `profile`，取得電子郵件需要 `email`。這些範圍可單獨或組合使用；未指定時預設使用 `openid`。',
  ],
  [
    "`profile` is required to get user's profile information, `email` is required to get user's email address. These scopes can be used individually or in combination; if no scopes are specified, `profile` will be used by default.",
    '获取用户资料需要 `profile`，获取邮箱需要 `email`。这些作用域可单独或组合使用；未指定时默认使用 `profile`。',
    '取得使用者資料需要 `profile`，取得電子郵件需要 `email`。這些範圍可單獨或組合使用；未指定時預設使用 `profile`。',
  ],
  [
    'Generate a permanent token from a Meta Business System User with whatsapp_business_messaging and whatsapp_business_management permissions.',
    '通过 Meta 企业系统用户生成持久令牌，并授予 whatsapp_business_messaging 和 whatsapp_business_management 权限。',
    '透過 Meta 企業系統使用者產生持續權杖，並授予 whatsapp_business_messaging 和 whatsapp_business_management 權限。',
  ],
];
