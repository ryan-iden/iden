import { type Nullable } from '@silverhand/essentials';

const anonymousAvatarSeed = 'iden-user';

/** Pick a stable, non-empty identity value for deterministic generated avatars. */
export const resolveDefaultAvatarSeed = (
  ...candidates: ReadonlyArray<Nullable<string> | undefined>
): string =>
  candidates.find((candidate): candidate is string => Boolean(candidate?.trim()))?.trim() ??
  anonymousAvatarSeed;
