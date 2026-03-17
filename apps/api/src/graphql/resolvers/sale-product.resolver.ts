import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';

import {
  AssetGraphqlType,
  CategoryGraphqlType,
  OrganizationGraphqlType,
  SaleProductGraphqlType,
  toAssetGraphqlType,
  toCategoryGraphqlType,
  toOrganizationGraphqlType,
} from '../types';

import type { GraphqlContext } from '../../server/graphql-context';

@Resolver(() => SaleProductGraphqlType)
export class SaleProductResolver {
  @FieldResolver(() => [CategoryGraphqlType])
  async categories(
    @Root() saleProduct: SaleProductGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<CategoryGraphqlType[]> {
    return (
      await context.loaders.categoriesBySaleProductId.load(saleProduct.id)
    ).map(toCategoryGraphqlType);
  }

  @FieldResolver(() => AssetGraphqlType)
  async cover(
    @Root() saleProduct: SaleProductGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<AssetGraphqlType> {
    return toAssetGraphqlType(
      await context.loaders.assetById.load(saleProduct.coverAssetId)
    );
  }

  @FieldResolver(() => OrganizationGraphqlType)
  async organization(
    @Root() saleProduct: SaleProductGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<OrganizationGraphqlType> {
    return toOrganizationGraphqlType(
      await context.loaders.organizationById.load(saleProduct.organizationId)
    );
  }
}
