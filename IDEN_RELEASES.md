# iden release line

iden and its SDKs are versioned independently from the upstream Logto projects.
The current iden product and SDK release is **0.0.1**.

| Repository | Distribution coordinate | Current version |
| --- | --- | --- |
| `ryan-iden/iden` | Container image / product release | `0.0.1` |
| `ryan-iden/js` | `@ryan-iden/*` | `0.0.1` |
| `ryan-iden/react-native` | `@ryan-iden/rn` | `0.0.1` |
| `ryan-iden/kotlin` | `io.github.ryan-wong-coder.iden:{kotlin,android}` | `0.0.1` |
| `ryan-iden/swift` | SwiftPM Git URL | `0.0.1` |
| `ryan-iden/dart` | `iden_sdk` | `0.0.1` |
| `ryan-iden/csharp` | `RyanIden.AspNetCore.Authentication` | `0.0.1` |
| `ryan-iden/go-sdk` | `github.com/ryan-iden/go-sdk` | `0.0.1` |
| `ryan-iden/php` | `ryan-iden/sdk` | `0.0.1` |
| `ryan-iden/python` | `iden-sdk` (`import iden`) | `0.0.1` |
| `ryan-iden/ruby` | `iden` | `0.0.1` |
| `ryan-iden/social-sdks` | GitHub release assets | `0.0.1` |

All SDK development occurs on `ryan-wong-coder-personal`. Upstream changes are
merged explicitly; upstream tags and package versions never advance the iden version.
Compatibility-facing protocol constants and established public symbols retain their
Logto names when renaming them would break applications.

## Publication targets

| Ecosystem | Release trigger | Registry authentication |
| --- | --- | --- |
| npm | manual `publish-iden.yml` run | npm trusted publisher after the initial scoped-package publication |
| Maven Central | `iden-v<version>` tag | Central Portal token and in-memory PGP signing key |
| SwiftPM | `v<version>` tag | public Git tag and GitHub release |
| pub.dev | `iden-v<version>` tag | pub.dev GitHub OIDC after the required first manual publication |
| NuGet | `iden-v<version>` tag | NuGet trusted publishing |
| Go modules | `v<version>` tag | public Git tag indexed by `proxy.golang.org` |
| Packagist | `v<version>` tag | GitHub repository synchronization |
| PyPI | `iden-v<version>` tag | PyPI trusted publishing |
| RubyGems | `iden-v<version>` tag | RubyGems trusted publishing |

The GitHub deployment environments used by these workflows are created in the
corresponding SDK repositories. Registry credentials are never committed.
