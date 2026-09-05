const api_resource_details = {
  page_title: '介面資源詳情',
  back_to_api_resources: '返回介面資源',
  general_tab: '常規',
  permissions_tab: '權限',
  settings: '設置',
  settings_description:
    '介面資源，又稱資源指示器，表示要請求的目標服務或資源，通常是表示資源身份的位址格式變數。',
  management_api_settings_description:
    'Logto管理介面是一個全面的介面集合，使管理員能夠管理各種與身份有關的任務，執行安全策略，並遵守法規和標準。',
  management_api_notice:
    '此介面代表Logto實體，不能修改或刪除。創建機器對機器應用程式以調用Logto管理介面。<a>了解更多</a>',
  token_expiration_time_in_seconds: '權杖過期時間（秒）',
  token_expiration_time_in_seconds_placeholder: '請輸入你的權杖過期時間',
  delete_description:
    '本操作會永久性地刪除該介面資源，且不可撤銷。輸入介面資源名稱 <span>{{name}}</span> 確認。',
  enter_your_api_resource_name: '輸入介面資源名稱',
  api_resource_deleted: ' 介面資源 {{name}} 已刪除.',
  permission: {
    create_button: '創建權限',
    create_title: '創建權限',
    create_subtitle: '定義此介面所需的權限(範圍)。',
    confirm_create: '創建權限',
    edit_title: '編輯介面權限',
    edit_subtitle: '定義 {{resourceName}} 介面需要的權限(範圍)。',
    name: '權限名稱',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '權限名稱不能包含空格。',
    description: '描述',
    description_placeholder: '能夠讀取資源',
    permission_created: '權限 "{{name}}" 已成功創建',
    delete_description: '如果刪除此權限，擁有該權限的用戶將失去由此權限授予的訪問權限。',
    deleted: '成功刪除權限 "{{name}}"。',
  },
};

export default Object.freeze(api_resource_details);
