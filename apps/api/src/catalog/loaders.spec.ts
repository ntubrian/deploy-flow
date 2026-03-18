import { createCatalogLoaders } from './loaders';

import type { CatalogRepositories } from './repositories';

describe('catalog loaders', () => {
  const assetFindByIds = jest.fn();
  const categoryFindAll = jest.fn();
  const categoryFindByDonationProjectIds = jest.fn();
  const categoryFindByIds = jest.fn();
  const categoryFindByOrganizationIds = jest.fn();
  const categoryFindBySaleProductIds = jest.fn();
  const donationProjectFindConnection = jest.fn();
  const organizationFindByIds = jest.fn();
  const organizationFindConnection = jest.fn();
  const saleProductFindConnection = jest.fn();

  const repositories = {
    assetRepository: {
      findByIds: assetFindByIds,
    },
    categoryRepository: {
      findAll: categoryFindAll,
      findByDonationProjectIds: categoryFindByDonationProjectIds,
      findByIds: categoryFindByIds,
      findByOrganizationIds: categoryFindByOrganizationIds,
      findBySaleProductIds: categoryFindBySaleProductIds,
    },
    donationProjectRepository: {
      findConnection: donationProjectFindConnection,
    },
    organizationRepository: {
      findByIds: organizationFindByIds,
      findConnection: organizationFindConnection,
    },
    saleProductRepository: {
      findConnection: saleProductFindConnection,
    },
  } as unknown as CatalogRepositories;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('batches assets and preserves key order', async () => {
    assetFindByIds.mockResolvedValue([
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

    expect(assetFindByIds).toHaveBeenCalledWith(['asset-1', 'asset-2']);
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
    categoryFindByOrganizationIds.mockResolvedValue(
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

    expect(categoryFindByOrganizationIds).toHaveBeenCalledWith([
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
