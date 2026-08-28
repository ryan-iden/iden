#!/usr/bin/env bash

set -Eeuo pipefail

if [[ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]] ||
  [[ "$(docker info --format '{{.Swarm.ControlAvailable}}')" != "true" ]]; then
  echo 'Run this script on a Docker Swarm manager.' >&2
  exit 1
fi

create_random_secret() {
  local name="$1"

  if docker secret inspect "$name" >/dev/null 2>&1; then
    echo "Swarm secret already exists: ${name}"
    return
  fi

  openssl rand -hex 32 | docker secret create "$name" - >/dev/null
  echo "Created Swarm secret: ${name}"
}

if ! docker network inspect logto-public >/dev/null 2>&1; then
  docker network create --driver overlay --attachable logto-public >/dev/null
  echo 'Created overlay network: logto-public'
fi

create_random_secret logto_postgres_password
create_random_secret logto_protected_app_gateway_shared_secret
