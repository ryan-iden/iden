# Logto Docker Swarm deployment

This directory is the production deployment source for the personal self-hosted build. A push to
`ryan-wong-coder-personal` builds an immutable image in GHCR and deploys it to the three-node Swarm.

## One-time manager bootstrap

Run the bootstrap script once on a Swarm manager before the first deployment:

```bash
bash bootstrap.sh
```

It creates the `logto-public` overlay network and two randomly generated external Swarm secrets.
Secret values are never stored in Git or GitHub Actions.

The production GitHub environment must define:

| Type     | Name                           | Purpose                                                      |
| -------- | ------------------------------ | ------------------------------------------------------------ |
| Variable | `SWARM_MANAGER_HOST`           | Public SSH address of a Swarm manager                        |
| Variable | `SWARM_DEPLOY_USER`            | Dedicated user with access to the Docker socket              |
| Variable | `SWARM_STACK_NAME`             | Stack name; defaults to `logto`                              |
| Variable | `LOGTO_HOST`                   | Public authentication endpoint host or IP address            |
| Variable | `LOGTO_ADMIN_HOST`             | Public Admin Console host or IP address                      |
| Variable | `LOGTO_ADMIN_PORT`             | Dedicated HTTPS port for the Admin Console                   |
| Variable | `LOGTO_PLACEMENT_HOSTNAME`     | Swarm hostname that owns persistent volumes and ports 80/443 |
| Variable | `TRAEFIK_VERSION`              | Pinned Traefik image tag                                     |
| Variable | `PROTECTED_APP_GATEWAY_DOMAIN` | Base domain reserved for Protected App routing               |
| Variable | `ACME_EMAIL`                   | Let's Encrypt account and expiry-notice address              |
| Secret   | `SWARM_SSH_PRIVATE_KEY`        | Dedicated deployment SSH private key                         |
| Secret   | `SWARM_KNOWN_HOSTS`            | Pinned SSH host key for the manager                          |

The stack keeps PostgreSQL, Logto assets, and ACME state in local Docker volumes. The stateful
services are constrained to `LOGTO_PLACEMENT_HOSTNAME`; changing that variable requires migrating
the volumes first.

Traefik exposes only the two Logto endpoints. The lego renewal service obtains six-day direct-IP
certificates with an ACME HTTP challenge and checks for renewal every 12 hours. Traefik hot-reloads
the renewed certificate from a shared volume.
Its dashboard is disabled. The Protected App gateway process is intentionally not exposed by this
stack because wildcard TLS cannot be issued for an IP-encoded test domain with an HTTP challenge.
Add a real delegated domain and DNS challenge before exposing that gateway publicly.
