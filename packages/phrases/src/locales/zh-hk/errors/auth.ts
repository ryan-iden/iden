const auth = {
  authorization_header_missing: '缺少授權（Authorization）請求標頭。',
  authorization_token_type_not_supported: 'Authorization權杖類型不支援',
  unauthorized: '未經授權。請檢查憑證及其範圍。',
  forbidden: '禁止訪問。請檢查用戶角色與權限。',
  expected_role_not_found: '未找到期望的角色。請檢查用戶角色與權限。',
  jwt_sub_missing: 'JavaScript物件表示法（JSON）網路權杖（JWT）缺失 `sub`',
  require_re_authentication: '需要重新認證以進行受保護操作。',
  exceed_token_limit: '超過權杖限制。請聯絡你的管理員。',
  third_party_application_forbidden: '第三方應用程式不允許透過此介面修改帳戶資料。',
};

export default Object.freeze(auth);
