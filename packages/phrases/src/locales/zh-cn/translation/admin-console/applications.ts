const applications = {
  page_title: '全部应用',
  title: '全部应用',
  subtitle: '创建移动应用、单页应用、机器对机器应用或传统网页应用，并通过 Logto 进行身份验证',
  subtitle_with_app_type: '为你的 {{name}} 应用程序设置Logto身份验证',
  create_device_flow_description:
    '创建一个使用开放授权（OAuth） 2.0 设备授权许可的原生应用，适用于输入受限设备或无头应用。',
  create: '创建应用',
  create_third_party: '创建第三方应用',
  create_thrid_party_modal_title: '创建第三方应用（{{type}}）',
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  application_description: '应用描述',
  application_description_placeholder: '请输入应用描述',
  select_application_type: '选择应用类型',
  no_application_type_selected: '你还没有选择应用类型',
  application_created: '创建应用成功。',
  tab: {
    my_applications: '我的应用',
    third_party_applications: '第三方应用',
  },
  app_id: 'App标识',
  type: {
    native: {
      title: '原生应用',
      subtitle: '在原生环境中运行的应用程序',
      description: '例如iOS应用程序、Android应用程序、桌面应用程序、电视、CLI',
    },
    spa: {
      title: '单页应用',
      subtitle: '在浏览器中运行并动态更新数据的应用程序',
      description: '例如React DOM应用程序，Vue应用程序',
    },
    traditional: {
      title: '传统网页应用',
      subtitle: '由网页服务器渲染和更新的应用程序',
      description: '例如Next.js, PHP',
    },
    machine_to_machine: {
      title: '机器对机器',
      subtitle: '直接与资源对话的应用程序（通常是服务）',
      description: '例如后端服务',
    },
    protected: {
      title: '受保护的应用',
      subtitle: '受Logto保护的应用程序',
      description: 'N/A',
    },
    saml: {
      title: '安全断言标记语言（SAML）应用',
      subtitle: '用作安全断言标记语言（SAML）身份提供商连接器的应用程序',
      description: '例如，安全断言标记语言（SAML）',
    },
    third_party: {
      title: '第三方应用',
      subtitle: '用作第三方身份提供商连接器的应用程序',
      description: '例如，开放身份连接（OIDC），安全断言标记语言（SAML）',
    },
  },
  authorization_flow: {
    title: '授权流程',
    tooltip: '选择应用的授权流程。一旦设置，将无法更改。',
    authorization_code: {
      title: '授权码',
      description: '默认且最常见的授权类型。用户将被重定向到登录页面以直接授权访问。',
    },
    device_flow: {
      title: '设备授权流程',
      description:
        '适用于输入受限的设备或无界面应用（如电视、命令行界面）。用户可在另一台设备上输入设备码或扫描二维码完成登录。',
    },
  },
  placeholder_title: '选择应用程序类型以继续',
  placeholder_description:
    'Logto使用开放身份连接（OIDC）的应用程序实体来帮助识别你的应用程序、管理登录和创建审计日志等任务。',
  third_party_application_placeholder_description:
    '使用Logto作为身份提供者为第三方服务提供开放授权（OAuth）授权。\n 包括资源访问的预建用户同意屏幕。<a>了解更多</a>',
  dynamic_app: {
    title: '动态应用',
    subtitle: 'CIMD',
    description: '动态应用允许开放授权（OAuth）客户端无需预先注册即可接入。',
    settings_description:
      '动态应用允许开放授权（OAuth）客户端无需预先注册即可接入，并遵循客户端标识符元数据文档（CIMD）规范。',
    beta_notice:
      '动态应用目前处于测试阶段。欢迎您去探索并<ContactLink>分享您的反馈</ContactLink>。',
    app_id_placeholder: '由每个客户端动态提供',
    enable_confirm_modal: {
      title: '启用动态客户端接入？',
      content:
        '任何拥有有效公开超文本传输安全协议（HTTPS）客户端标识网址的开放授权（OAuth）客户端，都可以无需预先注册即向该租户发起授权。访问范围仍受你设置的最大权限和用户同意的限制。',
      beta_pricing_notice:
        '动态应用在测试版期间免费使用。测试版结束后可能会作为附加功能收费。届时我们会提前通知你，你也可以随时关闭它。',
    },
    enabled: '动态应用已成功启用。',
    disable_confirm_modal: {
      title: '禁用动态应用？',
      content:
        'CIMD客户端将无法再发起新的授权请求。已有的授权记录会保留，已签发的访问令牌在过期前可能仍然有效。',
    },
    disabled: '动态应用已成功禁用。',
    permissions: {
      user_title: '用户',
      user_description: '选择开放授权（OAuth）客户端访问特定用户数据所需的权限。',
      grant_user_level_permissions: '授予用户权限',
      organization_title: '组织',
      organization_description: '选择开放授权（OAuth）客户端访问特定组织数据所需的权限。',
      grant_organization_level_permissions: '授予组织权限',
      permission_delete_confirm:
        '此操作将从动态应用中移除该权限，阻止开放授权（OAuth）客户端就该权限请求用户授权。你确定要继续吗？',
    },
  },
  guide: {
    third_party: {
      title: '集成第三方应用',
      description:
        '使用Logto作为身份提供者为第三方服务提供开放授权（OAuth）授权。包含用于安全资源访问的预建用户同意屏幕。<a>了解更多</a>',
    },
  },
};

export default Object.freeze(applications);
