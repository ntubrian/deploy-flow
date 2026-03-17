import 'reflect-metadata';

import { CatalogQueryResolver } from './catalog-query.resolver';
import { GraphqlContext } from '../../server/graphql-context';

describe('CatalogQueryResolver', () => {
  const resolver = new CatalogQueryResolver();
  const context = {
    loaders: {
      assetById: {
        load: jest.fn(),
      },
      categoriesByDonationProjectId: {
        load: jest.fn(),
      },
      categoriesByOrganizationId: {
        load: jest.fn(),
      },
      categoriesBySaleProductId: {
        load: jest.fn(),
      },
      organizationById: {
        load: jest.fn(),
      },
    },
    repositories: {
      categoryRepository: {
        findAll: jest.fn().mockResolvedValue([]),
      },
      donationProjectRepository: {
        findConnection: jest.fn().mockResolvedValue({
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        }),
      },
      organizationRepository: {
        findConnection: jest.fn().mockResolvedValue({
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        }),
      },
      saleProductRepository: {
        findConnection: jest.fn().mockResolvedValue({
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        }),
      },
    },
  } as unknown as GraphqlContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes organization list arguments into the repository', async () => {
    const arguments_ = {
      after: 'cursor-1',
      categoryId: 'category-1',
      first: 20,
      keyword: '兒少',
    };

    await resolver.organizations(arguments_, context);

    expect(context.repositories.organizationRepository.findConnection).toHaveBeenCalledWith(
      arguments_
    );
  });

  it('loads categories through the category repository', async () => {
    await resolver.categories(context);

    expect(context.repositories.categoryRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('returns the health status string', () => {
    expect(resolver.health()).toBe('ok');
  });
});
