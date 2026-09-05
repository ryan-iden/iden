const domain = {
  not_configured: '域名主机提供商尚未配置。',
  cloudflare_data_missing: 'cloudflare_data缺失，请检查。',
  cloudflare_unknown_error: '请求Cloudflare接口时出现未知错误。',
  cloudflare_response_error: '从Cloudflare得到意外的响应。',
  limit_to_one_domain: '仅限一个自定义域名。',
  hostname_already_exists: '该域名在我们的服务器中已存在。',
  cloudflare_not_found: '在Cloudflare中找不到主机名',
  domain_is_not_allowed: '该域名不允许。',
  domain_in_use: '域名 {{domain}} 已被占用。',
  exceed_domain_limit: '最多只允许 {{limit}} 个自定义域名。',
};

export default Object.freeze(domain);
