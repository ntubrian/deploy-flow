import { createCatalogLoaders } from './loaders';

import type { CatalogRepositories } from './repositories';

describe('catalog loaders', () => {
  const repositories = {
    assetRepository: {
      findByIds: jest.fn(),
    },
    categoryRepository: {
      findAll: jest.fn(),
      findByDonationProjectIds: jest.fn(),
      findByIds: jest.fn(),
      findByOrganizationIds: jest.fn(),
      findBySaleProductIds: jest.fn(),
    },
    donationProjectRepository: {
      findConnection: jest.fn(),
    },
    organizationRepository: {
      findByIds: jest.fn(),
      findConnection: jest.fn(),
    },
    saleProductRepository: {
      findConnection: jest.fn(),
    },
  } as unknown as jest.Mocked<CatalogRepositories>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('batches assets and preserves key order', async () => {
    repositories.assetRepository.findByIds.mockResolvedValue([
      {
        altText: 'second',
        id: 'asset-2',
        url: 'https://example.com/2.png',
      },
      {
        altText: 'first',
        id: 'asset-1',
        url: 'https://example.com/1.png',
      },
    ] as never);

    const loaders = createCatalogLoaders(repositories);
    const assets = await loaders.assetById.loadMany(['asset-1', 'asset-2']);

    expect(repositories.assetRepository.findByIds).toHaveBeenCalledWith([
      'asset-1',
      'asset-2',
    ]);
    expect(assets).toEqual([
      {
        altText: 'first',
        id: 'asset-1',
        url: 'https://example.com/1.png',
      },
      {
        altText: 'second',
        id: 'asset-2',
        url: 'https://example.com/2.png',
      },
    ]);
  });

  it('returns grouped categories for organizations', async () => {
    repositories.categoryRepository.findByOrganizationIds.mockResolvedValue(
      new Map([
        [
          'organization-1',
          [
            {
              id: 'category-1',
              name: '兒少照護',
              sortOrder: 1,
            },
          ],
        ],
      ]) as never
    );

    const loaders = createCatalogLoaders(repositories);
    const categories = await loaders.categoriesByOrganizationId.loadMany([
      'organization-1',
      'organization-2',
    ]);

    expect(repositories.categoryRepository.findByOrganizationIds).toHaveBeenCalledWith([
      'organization-1',
      'organization-2',
    ]);
    expect(categories).toEqual([
      [
        {
          id: 'category-1',
          name: '兒少照護',
          sortOrder: 1,
        },
      ],
      [],
    ]);
  });
});
