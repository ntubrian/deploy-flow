import 'reflect-metadata';

import { GraphQLSchema } from 'graphql';
import { buildSchemaSync } from 'type-graphql';

import { CatalogQueryResolver } from './resolvers/catalog-query.resolver';
import { DonationProjectResolver } from './resolvers/donation-project.resolver';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { SaleProductResolver } from './resolvers/sale-product.resolver';

let cachedSchema: GraphQLSchema | undefined;

export function getGraphqlSchema(): GraphQLSchema {
  if (cachedSchema) {
    return cachedSchema;
  }

  cachedSchema = buildSchemaSync({
    resolvers: [
      CatalogQueryResolver,
      DonationProjectResolver,
      OrganizationResolver,
      SaleProductResolver,
    ],
    validate: false,
  });

  return cachedSchema;
}
