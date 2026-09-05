const auth = {
  authorization_header_missing: '缺少授权（Authorization）请求头。',
  authorization_token_type_not_supported: 'Authorization令牌类型不支持',
  unauthorized: '未经授权。请检查凭据及其范围。',
  forbidden: '禁止访问。请检查用户角色与权限。',
  expected_role_not_found: '未找到期望的角色。请检查用户角色与权限。',
  jwt_sub_missing: 'JavaScript对象表示法（JSON）网络令牌（JWT）缺失 `sub`',
  require_re_authentication: '需要重新认证以进行受保护操作。',
  exceed_token_limit: '令牌限制已超出。请联系你的管理员。',
  third_party_application_forbidden: '第三方应用程序不允许通过此接口修改账户数据。',
};

export default Object.freeze(auth);
