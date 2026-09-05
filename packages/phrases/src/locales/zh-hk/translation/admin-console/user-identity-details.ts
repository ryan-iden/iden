const user_identity_details = {
  social_identity_page_title: '社交身份詳情',
  back_to_user_details: '返回用戶詳情',
  delete_identity: `移除身份連接`,
  social_account: {
    title: '社交賬戶',
    description: '查看從已連接的 {{connectorName}} 賬戶同步的用戶數據和個人資料信息。',
    provider_name: '社交身份提供者名稱',
    identity_id: '社交身份識別碼',
    user_profile: '從社交身份提供者同步的用戶簡介',
  },
  sso_account: {
    title: '企業單一登入賬戶',
    description: '查看從已連接的 {{connectorName}} 賬戶同步的用戶數據和個人資料信息。',
    provider_name: '企業單一登入身份提供者名稱',
    identity_id: '企業單一登入身份識別碼',
    user_profile: '從企業單一登入身份提供者同步的用戶簡介',
  },
  token_storage: {
    title: '訪問令牌',
    description:
      '將來自 {{connectorName}} 的存取權杖和重新整理權杖儲存在密鑰保險庫（Secret Vault）中，無需用戶重複同意即可自動呼叫介面。',
  },
  access_token: {
    title: '訪問令牌',
    description_active:
      '存取權杖有效且安全地儲存在密鑰保險庫（Secret Vault）中。你的產品可以使用它存取 {{connectorName}} 的介面。',
    description_inactive: '此訪問令牌不活躍（例如，被撤銷）。用戶必須重新授權以恢復功能。',
    description_expired:
      '此訪問令牌已過期。在刷新令牌的下一個介面請求時自動更新。如果刷新令牌不可用，需重新進行用戶身份驗證。',
  },
  refresh_token: {
    available: '刷新令牌可用。如果訪問令牌過期，將自動使用刷新令牌進行刷新。',
    not_available: '刷新令牌不可用。在訪問令牌過期後，用戶必須重新進行身份驗證以獲取新令牌。',
  },
  token_status: '令牌狀態',
  created_at: '創建於',
  updated_at: '更新於',
  expires_at: '到期於',
  scopes: '範圍',
  delete_tokens: {
    title: '刪除令牌',
    description: '刪除已存儲的令牌。用戶必須重新授權以恢復功能。',
    confirmation_message:
      '確定要刪除權杖嗎？Logto 密鑰保險庫將刪除已儲存的 {{connectorName}} 存取權杖和重新整理權杖。該用戶必須重新授權，才能恢復對 {{connectorName}} 介面的存取。',
  },
  token_storage_disabled: {
    title: '此連接器的令牌存儲已禁用',
    description:
      '用戶目前僅能在每次同意流期間使用 {{connectorName}} 進行登錄、鏈接賬戶或同步簡介。要訪問 {{connectorName}} 介面並代表用戶執行操作，請在中啟用令牌存儲。',
  },
};

export default Object.freeze(user_identity_details);
