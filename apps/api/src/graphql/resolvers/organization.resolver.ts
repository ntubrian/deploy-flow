import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';

import {
  AssetGraphqlType,
  CategoryGraphqlType,
  OrganizationGraphqlType,
  toAssetGraphqlType,
  toCategoryGraphqlType,
} from '../types';

import type { GraphqlContext } from '../../server/graphql-context';

@Resolver(() => OrganizationGraphqlType)
export class OrganizationResolver {
  @FieldResolver(() => [CategoryGraphqlType])
  async categories(
    @Root() organization: OrganizationGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<CategoryGraphqlType[]> {
    return (
      await context.loaders.categoriesByOrganizationId.load(organization.id)
    ).map(toCategoryGraphqlType);
  }

  @FieldResolver(() => AssetGraphqlType)
  async logo(
    @Root() organization: OrganizationGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<AssetGraphqlType> {
    return toAssetGraphqlType(
      await context.loaders.assetById.load(organization.logoAssetId)
    );
  }
}
