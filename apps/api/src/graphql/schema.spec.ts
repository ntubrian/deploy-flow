import { printSchema } from 'graphql';

import { getGraphqlSchema } from './schema';

describe('getGraphqlSchema', () => {
  it('builds a schema that documents cursor pagination arguments', () => {
    const schemaText = printSchema(getGraphqlSchema());

    expect(schemaText).toContain('type Query');
    expect(schemaText).toContain('organizations(');
    expect(schemaText).toContain('Category id filter. Omit or pass null to include all records.');
    expect(schemaText).toContain('Lists donation projects using cursor-based pagination.');
  });
});
