const signing_keys = {
  title: '簽名密鑰',
  description: '安全管理應用程式使用的簽名密鑰。',
  private_key: '開放身分連接（OIDC）私鑰',
  private_keys_description:
    '開放身分連接（OIDC）私鑰用於簽署JavaScript物件表示法（JSON）網路權杖（JWT）令牌。',
  cookie_key: '開放身分連接（OIDC）瀏覽器儲存資料密鑰',
  cookie_keys_description: '開放身分連接（OIDC）瀏覽器儲存資料密鑰用於簽署瀏覽器儲存資料。',
  private_keys_in_use: '正在使用的私密金鑰',
  cookie_keys_in_use: '正在使用的瀏覽器儲存憑證（Cookie）金鑰',
  rotate_private_keys: '輪換私密金鑰',
  rotate_cookie_keys: '輪換瀏覽器儲存憑證（Cookie）金鑰',
  rotate_private_keys_description:
    '此操作將創建一個新的私密簽署金鑰，輪換當前金鑰並刪除以前的金鑰。您的使用當前金鑰簽署的JavaScript物件表示法（JSON）網路權杖（JWT）標記將保持有效，直到刪除或再次輪換。',
  rotate_cookie_keys_description:
    '此操作將創建一個新的瀏覽器儲存資料金鑰，輪換當前金鑰並刪除以前的金鑰。使用當前金鑰簽署的瀏覽器儲存資料將保持有效，直到刪除或再次輪換。',
  select_private_key_algorithm: '選擇新私密金鑰的簽署算法',
  rotate_button: '輪換',
  table_column: {
    id: '識別碼',
    status: '狀態',
    algorithm: '簽署金鑰算法',
    effective_at: '生效時間',
  },
  status: {
    next: '待切換',
    current: '當前',
    previous: '舊金鑰',
    effective_in: '將於 {{time}} 後生效',
  },
  reminder: {
    rotate_private_key:
      '您確定要輪換<strong>開放身分連接（OIDC）私密金鑰</strong>嗎？使用新金鑰發放的JavaScript物件表示法（JSON）網路權杖（JWT）標記將由新金鑰簽署。使用當前金鑰簽署的JavaScript物件表示法（JSON）網路權杖（JWT）標記將保持有效，直到您再次輪換。',
    rotate_cookie_key:
      '您確定要輪換<strong>開放身分連接（OIDC）瀏覽器儲存憑證（Cookie）金鑰</strong>嗎？在登錄會話中生成的新瀏覽器儲存資料將由新瀏覽器儲存資料金鑰簽署。使用當前金鑰簽署的瀏覽器儲存資料將保持有效，直到您再次輪換。',
    delete_private_key:
      '您確定要刪除<strong>開放身分連接（OIDC）私密金鑰</strong>嗎？使用此私密簽署金鑰簽署的現有JavaScript物件表示法（JSON）網路權杖（JWT）標記將不再有效。',
    delete_cookie_key:
      '您確定要刪除<strong>開放身分連接（OIDC）瀏覽器儲存憑證（Cookie）金鑰</strong>嗎？使用此瀏覽器儲存資料金鑰簽署的較舊的登錄會話中的瀏覽器儲存資料不再有效，這些用戶需要重新驗證。',
  },
  messages: {
    rotate_key_success: '簽署金鑰輪換成功。',
    delete_key_success: '金鑰成功刪除。',
  },
};

export default Object.freeze(signing_keys);
