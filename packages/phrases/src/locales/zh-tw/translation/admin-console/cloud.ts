const cloud = {
  general: {
    onboarding: '入門',
  },
  create_tenant: {
    page_title: '新增租戶',
    title: '創建你的第一個租戶',
    description: '租戶是一個隔離的環境，你可以在其中管理用戶身份、應用程式和所有其他Logto資源。',
    invite_collaborators: '通過電子郵件邀請你的合作者',
    hear_about_us: {
      title: '你最初是從哪裡認識Logto的?',
      detail_placeholder: '告訴我們更多(可選)',
      options: {
        search_engine: '搜尋引擎(Google、Bing等)',
        ai_assistant: '人工智慧助手(ChatGPT、Claude、Gemini等)',
        github_oss: 'GitHub或開源目錄',
        friend_colleague: '朋友或同事推薦',
        powered_by: '某個使用Logto的應用程式的登入頁',
        content_social: '社交媒體、文章或影片(YouTube、X、Reddit等)',
        other: '其他',
      },
    },
  },
  social_callback: {
    title: '你已成功登錄',
    description:
      '你已成功使用社交帳戶登錄。為確保與Logto的無縫集成並獲得所有功能的訪問權限，我們建議你繼續配置自己的社交連接器。',
    notice:
      '請避免在生產環境中使用示範連接器。在完成測試後，請刪除示範連接器，並使用你的憑證設定自己的連接器。',
  },
  tenant: {
    create_tenant: '新增租戶',
  },
};

export default Object.freeze(cloud);
