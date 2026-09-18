import { SetMetadata } from '@nestjs/common';

export const REQUIRE_CAPABILITY_KEY = 'finch:requireCapability';

/** Declares the Membership capability `AuthorizationGuard` must find granted. */
export const RequireCapability = (capability: string): MethodDecorator =>
  SetMetadata(REQUIRE_CAPABILITY_KEY, capability);
