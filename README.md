<p align="center">
  <img src="./packages/toolkit/core-kit/assets/iden-app-icon.svg" width="96" alt="iden logo">
</p>

<h1 align="center">iden</h1>

<p align="center"><strong>Identity, Unified.</strong></p>

<p align="center">
  <a href="https://github.com/ryan-iden/iden/actions/workflows/self-hosted-release.yml"><img src="https://github.com/ryan-iden/iden/actions/workflows/self-hosted-release.yml/badge.svg?branch=ryan-wong-coder-personal" alt="Self-hosted release"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MPL--2.0-5B5CF6" alt="MPL-2.0"></a>
</p>

iden 是面向单实例自托管环境的身份与访问管理平台，提供统一的登录体验、用户中心、组织自治、应用接入和 API 授权能力。项目以简洁、现代的管理体验为目标，同时保持对 OIDC、OAuth 2.1、SAML 及现有 SDK 生态的兼容。

## 主要能力

- 登录、注册、账号恢复和多因素认证
- Passkey、社交登录和企业 SSO
- 用户、应用、API 资源、角色与审计日志管理
- 多租户控制台和控制台协作者
- 组织中心、成员邀请、Owner 与细粒度组织管理角色
- 组织品牌、头像、安全策略、JIT 和 M2M 关联
- 组织角色、全局 RBAC 和组织上下文授权
- Protected App 网关和自定义登录 UI
- SMTP、SendGrid、兼容邮件供应商及本地发件箱
- 本地化内置帮助中心和明暗主题

## 分支策略

| 分支 | 用途 |
| --- | --- |
| `ryan-wong-coder-personal` | iden 的主开发与生产发布分支 |
| `master` | 保持上游同步的基线分支 |

上游更新先同步到 `master`，验证后再合并到 `ryan-wong-coder-personal`。生产环境不会直接从 `master` 发布。

## 本地开发

### 环境要求

- Node.js 22
- pnpm 10
- PostgreSQL

```bash
pnpm install --frozen-lockfile
pnpm prepack
SELF_HOSTED_PARITY_ENABLED=true pnpm dev
```

`SELF_HOSTED_PARITY_ENABLED` 默认关闭。自托管扩展部署需要显式设置为 `true`，Cloud 构建不会启用这些能力。

## SDK 与协议兼容

iden 保持既有协议端点、公开字段和 SDK 包名兼容。应用可以继续使用 `@logto/*`、`io.logto.sdk:*`、`logto_dart_sdk` 等 SDK，只需将 endpoint 指向 iden 实例。

SDK 镜像维护在 [`ryan-iden`](https://github.com/ryan-iden) 组织：

- JavaScript / TypeScript：[`ryan-iden/js`](https://github.com/ryan-iden/js)
- Android Kotlin / Java：[`ryan-iden/kotlin`](https://github.com/ryan-iden/kotlin)
- Swift：[`ryan-iden/swift`](https://github.com/ryan-iden/swift)
- Flutter / Dart：[`ryan-iden/dart`](https://github.com/ryan-iden/dart)
- React Native / Expo：[`ryan-iden/react-native`](https://github.com/ryan-iden/react-native)
- .NET：[`ryan-iden/csharp`](https://github.com/ryan-iden/csharp)
- Go：[`ryan-iden/go`](https://github.com/ryan-iden/go)
- PHP：[`ryan-iden/php`](https://github.com/ryan-iden/php)
- Python：[`ryan-iden/python`](https://github.com/ryan-iden/python)
- Ruby：[`ryan-iden/ruby`](https://github.com/ryan-iden/ruby)

## 构建与发布

推送到 `ryan-wong-coder-personal` 后，GitHub Actions 会依次执行：

1. 工作区构建、类型检查、lint 和测试
2. 自托管与兼容构建验证
3. 构建不可变 GHCR 镜像
4. 滚动发布到生产 Swarm
5. 验证 Core、Console 和内置帮助中心健康状态

Swarm 部署清单位于 [`deploy/swarm`](./deploy/swarm)，发布工作流位于 [`.github/workflows/self-hosted-release.yml`](./.github/workflows/self-hosted-release.yml)。

## 开源声明

iden is based on [Logto](https://github.com/logto-io/logto), open-source software licensed under the Mozilla Public License 2.0.

本仓库保留上游的协议、SDK、数据库和内部兼容名称。iden 的品牌和自托管扩展由当前 fork 独立维护；Logto 名称仅用于必要的技术兼容与开源归属说明。

许可条款见 [MPL-2.0](./LICENSE)。
