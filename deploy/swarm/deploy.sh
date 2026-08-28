#!/usr/bin/env bash

set -Eeuo pipefail

compose_file="${1:?Usage: deploy.sh <compose-file> [stack-name] [expected-app-image]}"
stack_name="${2:-logto}"
expected_app_image="${3:-}"
timeout_seconds="${DEPLOY_TIMEOUT_SECONDS:-600}"

if [[ ! -f "$compose_file" ]]; then
  echo "Compose file does not exist: ${compose_file}" >&2
  exit 1
fi

if [[ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]] ||
  [[ "$(docker info --format '{{.Swarm.ControlAvailable}}')" != "true" ]]; then
  echo 'Deployments must run on a Docker Swarm manager.' >&2
  exit 1
fi

for secret in logto_postgres_password logto_protected_app_gateway_shared_secret; do
  if ! docker secret inspect "$secret" >/dev/null 2>&1; then
    echo "Missing external Swarm secret: ${secret}. Run bootstrap.sh once." >&2
    exit 1
  fi
done

if ! docker network inspect logto-public >/dev/null 2>&1; then
  docker network create --driver overlay --attachable logto-public >/dev/null
fi

docker stack deploy \
  --compose-file "$compose_file" \
  --prune \
  --resolve-image changed \
  --with-registry-auth \
  "$stack_name"

services=(traefik acme-web acme-renewer postgres app)
deadline=$((SECONDS + timeout_seconds))

while ((SECONDS < deadline)); do
  all_ready=true

  for service in "${services[@]}"; do
    service_name="${stack_name}_${service}"
    replicas="$(
      docker service ls \
        --filter "name=${service_name}" \
        --format '{{.Replicas}}'
    )"

    if [[ "$replicas" != '1/1' ]]; then
      all_ready=false
      break
    fi

    update_state="$(
      docker service inspect "$service_name" \
        --format '{{if .UpdateStatus}}{{.UpdateStatus.State}}{{else}}none{{end}}'
    )"

    case "$update_state" in
      none | completed) ;;
      paused | rollback_*)
        echo "Service ${service_name} failed to update: ${update_state}" >&2
        docker service ps "$service_name" --no-trunc >&2 || true
        exit 1
        ;;
      *)
        all_ready=false
        break
        ;;
    esac
  done

  if [[ "$all_ready" == 'true' ]]; then
    deployed_image="$(
      docker service inspect "${stack_name}_app" \
        --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'
    )"

    if [[ -n "$expected_app_image" ]] && [[ "$deployed_image" != "${expected_app_image}"* ]]; then
      echo "App converged with an unexpected image: ${deployed_image}" >&2
      exit 1
    fi

    docker stack services "$stack_name"
    exit 0
  fi

  sleep 5
done

echo "Stack did not converge within ${timeout_seconds} seconds." >&2
docker stack services "$stack_name" >&2 || true
for service in "${services[@]}"; do
  docker service ps "${stack_name}_${service}" --no-trunc >&2 || true
done
exit 1
