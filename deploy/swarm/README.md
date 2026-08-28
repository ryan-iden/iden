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
| Variable | `LOGTO_HOST`                   | Public authentication endpoint hostname                      |
| Variable | `LOGTO_ADMIN_HOST`             | Public Admin Console hostname                                |
| Variable | `LOGTO_PLACEMENT_HOSTNAME`     | Swarm hostname that owns persistent volumes and ports 80/443 |
| Variable | `TRAEFIK_VERSION`              | Pinned Traefik image tag                                     |
| Variable | `PROTECTED_APP_GATEWAY_DOMAIN` | Base domain reserved for Protected App routing               |
| Secret   | `SWARM_SSH_PRIVATE_KEY`        | Dedicated deployment SSH private key                         |
| Secret   | `SWARM_KNOWN_HOSTS`            | Pinned SSH host key for the manager                          |

The stack keeps PostgreSQL, Logto assets, and ACME state in local Docker volumes. The stateful
services are constrained to `LOGTO_PLACEMENT_HOSTNAME`; changing that variable requires migrating
the volumes first.

Traefik exposes only the two Logto endpoints and obtains certificates with an ACME HTTP challenge.
Its dashboard is disabled. The Protected App gateway process is intentionally not exposed by this
stack because wildcard TLS cannot be issued for an IP-encoded test domain with an HTTP challenge.
Add a real delegated domain and DNS challenge before exposing that gateway publicly.
