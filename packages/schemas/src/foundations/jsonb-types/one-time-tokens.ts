import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { eventGuard, type InteractionEvent } from '../../types/interaction-event.js';

export type OneTimeTokenContext = {
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
  // Links a console invitation to its single-use authentication token.
  invitationId?: string;
  // Links an end-user organization invitation to its registration token.
  organizationInvitationId?: string;
  // Restricts this one-time token to a specific interaction event.
  interactionEvent?: InteractionEvent;
};

export const oneTimeTokenContextGuard = z
  .object({
    jitOrganizationIds: z.string().array(),
    invitationId: z.string(),
    organizationInvitationId: z.string(),
    interactionEvent: eventGuard,
  })
  .partial() satisfies ToZodObject<OneTimeTokenContext>;

export enum OneTimeTokenStatus {
  Active = 'active',
  Consumed = 'consumed',
  Revoked = 'revoked',
  Expired = 'expired',
}

export const oneTimeTokenStatusGuard = z.nativeEnum(OneTimeTokenStatus);
