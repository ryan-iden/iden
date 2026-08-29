# iden design QA

Date: 2026-08-29

## Visual source

- Selected direction: `/Users/ryan/.codex/generated_images/01a04386-3aec-7251-bdb4-e0a151727a84/exec-3ec4a0a4-7fb3-47a5-beb0-f60a04e14479.png`
- Production Console capture: `.artifacts/design-qa/production-console-applications-final.png`
- Production Help Center captures:
  - `.artifacts/design-qa/production-help-desktop.png`
  - `.artifacts/design-qa/production-help-mobile-menu-search.png`
- Side-by-side review artifacts:
  - `.artifacts/design-qa/source-help-reference-comparison.png`
  - `.artifacts/design-qa/source-help-comparison.png`

## Environments and viewports

- Browser: the user's signed-in Chrome session
- Production origin: `https://124.221.217.21:30443`
- Console desktop: 1384 × 872
- Help Center desktop: 1440 × 900
- Help Center mobile: 390 × 844
- Light and dark theme screenshots were checked during the implementation pass; production smoke testing used the active light theme.

## Visual review

- Confirmed the iden logo lockup, product title, `Identity, Unified.` slogan, and `#5B5CF6` interaction color in the production Console.
- Confirmed white and neutral surfaces, restrained borders, compact navigation, consistent spacing, and responsive Help Center navigation against the selected direction.
- Confirmed the Applications integration descriptions use iden product prose while SDK, package, protocol, and third-party identifiers remain intact.
- Confirmed the About page contains the required MPL-2.0 attribution and upstream/fork links without using the inherited logo as a primary brand element.
- Confirmed desktop and mobile Help Center menu/search interactions, including a Pagefind query for `MFA`.

## Functional review

- Traversed all 18 main Console sidebar destinations in production: Get Started, Dashboard, Applications, Sign-in Experience, MFA, Connectors, Enterprise SSO, Security, API Resources, Roles, Organization Template, Organizations, Users, Actions, Custom JWT, Webhooks, Audit Logs, and Tenant Settings.
- No page displayed `Failed to fetch`, invalid JSON, `invalid_target`, or a generic request-error state.
- A fresh production Chrome tab recorded no console warnings or errors after loading Applications and traversing the sidebar.
- Verified `/api/status` returns HTTP 204 and `/help/en/` returns HTTP 200.
- Verified the deployed Swarm service runs the immutable image for commit `200f9f4e1b09ab57c8e30247c6935f0a0f20797f`.

## Automated checks

- Console TypeScript check passed.
- Console lint passed.
- Console unit tests: 46 suites, 279 tests passed.
- Core-kit tests: 7 files, 100 tests passed.
- Self-hosted brand and local Help Center scan passed across 20 locales.
- GitHub release workflow passed self-hosted and Cloud builds, type checks, lint, styles, tests, image publication, Swarm rollout, and public endpoint checks.

final result: passed
