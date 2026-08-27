# Self-hosted production release

The `Self-hosted release` GitHub Actions workflow publishes this branch through the platform's
GitOps path:

1. Build, type-check, lint, and test the feature packages.
2. Build one `linux/amd64` image with `SELF_HOSTED_PARITY_ENABLED=true` compiled into the Console.
3. Push the image to Harbor with the full Git commit SHA as its immutable tag.
4. Update `apps/logto/kustomization.yaml` in `ryan-wong-coder/argo-config`.
5. Let Argo CD synchronize the new revision to K3s.

The workflow never receives a Kubernetes kubeconfig and does not call the Kubernetes API.

## GitHub configuration

Create a protected GitHub environment named `self-hosted-production`. Add these environment
secrets:

- `HARBOR_USERNAME`: a Harbor project robot account with push/pull access.
- `HARBOR_PASSWORD`: the robot account token.
- `ARGO_CONFIG_SSH_KEY`: the private half of a write-enabled deploy key installed only on
  `ryan-wong-coder/argo-config`.

Add these repository or environment variables:

- `HARBOR_HOST`: the Harbor host and port without a URL scheme.
- `HARBOR_PROJECT`: normally `apps`.
- `IMAGE_NAME`: normally `logto`; it defaults to `logto` when omitted.
- `RELEASE_RUNNER`: optional GitHub runner label. It defaults to `ubuntu-24.04`. A fixed-egress
  self-hosted runner is recommended so Harbor can allow only that runner's public IP.

Harbor currently uses HTTP. The workflow gives BuildKit an isolated insecure-registry
configuration and writes Harbor credentials only into the runner's temporary directory. No Harbor
or cluster credential is committed to either repository.

## One-time Argo CD bootstrap

Follow the README in `ryan-wong-coder/argo-config` to:

1. Add that repository to Argo CD with a read-only deploy key.
2. Create the runtime and Harbor pull Secrets directly in the `logto` namespace.
3. Apply `bootstrap/logto-application.yaml` once.

After bootstrap, every push to `ryan-wong-coder-personal` that passes the workflow is automatically
promoted by an immutable GitOps commit. Roll back by reverting the corresponding
`deploy(logto): <sha>` commit in the Argo configuration repository.
