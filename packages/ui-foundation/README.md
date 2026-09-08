# iden UI foundation

The private presentation boundary for the self-hosted Console, Experience, Account/Organization
Center, Help, Demo, Device Demo and Account Elements. Business routes, authorization, SDK identifiers
and public customization hooks stay in their owning packages.

## Design contract

- Light: fog `#F4F7F8`, white surfaces, deep cyan `#007C91`.
- Dark: graphite `#101418`, layered `#181E24` surfaces, glacier `#67E8F9`.
- Manrope is bundled locally; system fonts provide CJK/RTL coverage without remote font requests.
- Semantic variables live on `html[data-product-brand="iden"]`; component aliases live on the body.
  Tenant colors remain inline overrides. Cloud does not select these tokens.
- Custom logos take precedence over default geometric marks, including the authentication orbit.
- The foundation never writes tenant settings. Only new self-hosted database seeds use the new colors.
- State artwork uses vectors and theme tokens; product icons ship explicit light/dark variants.

## Motion contract

`useSurfaceMotion` and `MotionRuntime` own cleanup through `@gsap/react`. Event animations use
`contextSafe`; native/Shadow DOM adapters also own a GSAP context. Route entrances use at most six
explicit `data-iden-reveal` targets and finish in 340ms. Press feedback is 140ms. The finite identity
orbit completes within 700ms. Reduced motion skips spatial animations entirely. No animation gates
authentication, a request, navigation or submission. No perpetual or pointer-following effects run.

Run `pnpm --filter @iden/ui-foundation check:budget` to measure the bundled native and React graphs.
React itself is external to this incremental measurement; GSAP and its React adapter are included.
The limit is 60KB gzip per entry. This does not measure the total pre-existing application bundle.

## Visual and interaction verification

`pnpm --filter @logto/elements exec playwright test --config=visual.config.ts` exercises actual
shared components in development-only specimen entries. These entries are not Vite production build
inputs and are removed from the final container. Fixtures have no backend credentials and perform no
real user, tenant or organization mutations.

The automated matrix covers 360/390/768/1280/1440px, both themes, English/Chinese/Arabic, Chromium,
Firefox and WebKit, navigation focus restoration, member role editor geometry, form state, search,
embedded help theme messages, reduced motion and rapid pointer input. Reviewed Chromium 1280px
English snapshots are versioned; other matrix cells attach screenshots. CI retains HTML reports,
actual/expected/difference images on mismatch, traces and separate motion recordings. Snapshot
updates must be visually reviewed and never run automatically in CI.

These deterministic specimens are not a substitute for the existing authentication and Management
API integration suites. Device emulation does not certify physical iOS or Android hardware. Real
provider flows (MFA/Captcha/SSO), permissions, custom branding and deployment smoke checks belong to
the environment acceptance pass; do not mark them passed solely from fixture screenshots.

### Route coverage ownership

| Surface | Source of routes | Shared presentation owner |
| --- | --- | --- |
| Console | `console/src/hooks/use-console-routes.tsx` | ConsoleContent, workspace navigation, ds-components |
| Sign-in/register/verification/consent/error | `experience/src/App.tsx` | AppLayout, shared form components, AppBoundary |
| Account and all organization subpages | `account/src/App.tsx` | Account layout, shared settings rows, OrganizationCenter |
| Help and locale pages | `help-center/scripts/build.mjs` | Static surface bundle, Pagefind, HelpDrawer |
| Demo | `demo-app/src/App.tsx` | Demo layout, foundation artwork/motion |
| Device Demo | `device-demo-app/src/App.tsx` | Device surfaces, QR retained, foundation motion |
| Embedded account elements | `elements/src/account/elements` | Shadow DOM variable aliases and SurfaceController |

No route-specific artwork, color override or animation should bypass this shared presentation layer
without an explicit tenant customization requirement. Third-party provider/protocol marks remain
unchanged for recognition and compatibility.
