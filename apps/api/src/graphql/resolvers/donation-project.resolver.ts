import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';

import {
  AssetGraphqlType,
  CategoryGraphqlType,
  DonationProjectGraphqlType,
  OrganizationGraphqlType,
  toAssetGraphqlType,
  toCategoryGraphqlType,
  toOrganizationGraphqlType,
} from '../types';

import type { GraphqlContext } from '../../server/graphql-context';

@Resolver(() => DonationProjectGraphqlType)
export class DonationProjectResolver {
  @FieldResolver(() => [CategoryGraphqlType])
  async categories(
    @Root() donationProject: DonationProjectGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<CategoryGraphqlType[]> {
    return (
      await context.loaders.categoriesByDonationProjectId.load(donationProject.id)
    ).map(toCategoryGraphqlType);
  }

  @FieldResolver(() => AssetGraphqlType)
  async cover(
    @Root() donationProject: DonationProjectGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<AssetGraphqlType> {
    return toAssetGraphqlType(
      await context.loaders.assetById.load(donationProject.coverAssetId)
    );
  }

  @FieldResolver(() => OrganizationGraphqlType)
  async organization(
    @Root() donationProject: DonationProjectGraphqlType,
    @Ctx() context: GraphqlContext
  ): Promise<OrganizationGraphqlType> {
    return toOrganizationGraphqlType(
      await context.loaders.organizationById.load(donationProject.organizationId)
    );
  }
}
