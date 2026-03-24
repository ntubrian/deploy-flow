import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { CatalogConnectionArgs } from '../args';
import { Public } from '../auth/public.decorator';
import {
  CategoryGraphqlType,
  DonationProjectConnectionGraphqlType,
  OrganizationConnectionGraphqlType,
  SaleProductConnectionGraphqlType,
  toCategoryGraphqlType,
  toDonationProjectConnectionGraphqlType,
  toOrganizationConnectionGraphqlType,
  toSaleProductConnectionGraphqlType,
} from '../types';

import type { GraphqlContext } from '../../server/graphql-context';

@Resolver()
export class CatalogQueryResolver {
  @Query(() => [CategoryGraphqlType], {
    description: 'Lists all supported catalog categories in display order.',
  })
  async categories(
    @Ctx() context: GraphqlContext
  ): Promise<CategoryGraphqlType[]> {
    return (await context.repositories.categoryRepository.findAll()).map(
      toCategoryGraphqlType
    );
  }

  @Query(() => DonationProjectConnectionGraphqlType, {
    description: 'Lists donation projects using cursor-based pagination.',
  })
  async donationProjects(
    @Args() args: CatalogConnectionArgs,
    @Ctx() context: GraphqlContext
  ): Promise<DonationProjectConnectionGraphqlType> {
    return toDonationProjectConnectionGraphqlType(
      await context.repositories.donationProjectRepository.findConnection(args)
    );
  }

  @Query(() => String, {
    description: 'Lightweight health check for runtime diagnostics.',
  })
  @Public()
  health(): string {
    return 'ok';
  }

  @Query(() => OrganizationConnectionGraphqlType, {
    description: 'Lists organizations using cursor-based pagination.',
  })
  async organizations(
    @Args() args: CatalogConnectionArgs,
    @Ctx() context: GraphqlContext
  ): Promise<OrganizationConnectionGraphqlType> {
    return toOrganizationConnectionGraphqlType(
      await context.repositories.organizationRepository.findConnection(args)
    );
  }

  @Query(() => SaleProductConnectionGraphqlType, {
    description: 'Lists sale products using cursor-based pagination.',
  })
  async saleProducts(
    @Args() args: CatalogConnectionArgs,
    @Ctx() context: GraphqlContext
  ): Promise<SaleProductConnectionGraphqlType> {
    return toSaleProductConnectionGraphqlType(
      await context.repositories.saleProductRepository.findConnection(args)
    );
  }
}
