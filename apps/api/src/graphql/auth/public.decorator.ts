import { Extensions } from 'type-graphql';

export const PUBLIC_RESOLVER_EXTENSION_KEY = 'deployFlowPublic';

export function Public(): MethodDecorator {
  return Extensions({
    [PUBLIC_RESOLVER_EXTENSION_KEY]: true,
  });
}
