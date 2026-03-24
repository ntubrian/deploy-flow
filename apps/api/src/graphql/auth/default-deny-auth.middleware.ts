import { GraphQLError } from 'graphql';
import { type MiddlewareFn } from 'type-graphql';

import { PUBLIC_RESOLVER_EXTENSION_KEY } from './public.decorator';

import type { GraphqlContext } from '../../server/graphql-context';

export const defaultDenyAuthMiddleware: MiddlewareFn<GraphqlContext> = async (
  { context, info },
  next
) => {
  const field = info.parentType.getFields()[info.fieldName];
  const isPublicResolver =
    field?.extensions?.[PUBLIC_RESOLVER_EXTENSION_KEY] === true;

  if (isPublicResolver) {
    return next();
  }

  if (!context.webGate.isAuthenticated) {
    throw new GraphQLError('Unauthorized', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }

  return next();
};
