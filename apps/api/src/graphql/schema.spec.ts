import { printSchema } from 'graphql';

import { PUBLIC_RESOLVER_EXTENSION_KEY } from './auth/public.decorator';
import { getGraphqlSchema } from './schema';

describe('getGraphqlSchema', () => {
  it('builds a schema that documents cursor pagination arguments', () => {
    const schemaText = printSchema(getGraphqlSchema());

    expect(schemaText).toContain('type Query');
    expect(schemaText).toContain('organizations(');
    expect(schemaText).toContain('Category id filter. Omit or pass null to include all records.');
    expect(schemaText).toContain('Lists donation projects using cursor-based pagination.');
  });

  it('marks only explicitly public query fields as public', () => {
    const queryType = getGraphqlSchema().getQueryType();

    if (!queryType) {
      throw new Error('Query type must be defined.');
    }

    const publicQueryFields = Object.values(queryType.getFields())
      .filter(
        (field) => field.extensions?.[PUBLIC_RESOLVER_EXTENSION_KEY] === true
      )
      .map((field) => field.name)
      .sort();

    expect(publicQueryFields).toEqual(['health']);
  });
});
