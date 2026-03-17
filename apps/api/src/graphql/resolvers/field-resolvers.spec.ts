import 'reflect-metadata';

import { DonationProjectResolver } from './donation-project.resolver';
import { OrganizationResolver } from './organization.resolver';
import { SaleProductResolver } from './sale-product.resolver';
import { GraphqlContext } from '../../server/graphql-context';

describe('catalog field resolvers', () => {
  const organizationResolver = new OrganizationResolver();
  const donationProjectResolver = new DonationProjectResolver();
  const saleProductResolver = new SaleProductResolver();
  const context = {
    loaders: {
      assetById: {
        load: jest.fn().mockResolvedValue({
          altText: 'alt',
          id: 'asset-1',
          url: 'https://example.test/asset.png',
        }),
      },
      categoriesByDonationProjectId: {
        load: jest.fn().mockResolvedValue([]),
      },
      categoriesByOrganizationId: {
        load: jest.fn().mockResolvedValue([]),
      },
      categoriesBySaleProductId: {
        load: jest.fn().mockResolvedValue([]),
      },
      organizationById: {
        load: jest.fn().mockResolvedValue({
          id: 'organization-1',
          logoAssetId: 'asset-1',
          name: 'Org',
          summary: 'Summary',
        }),
      },
    },
  } as unknown as GraphqlContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads organization relations through request dataloaders', async () => {
    await organizationResolver.categories(
      {
        id: 'organization-1',
        logoAssetId: 'asset-1',
        name: 'Org',
        summary: 'Summary',
      },
      context
    );
    await organizationResolver.logo(
      {
        id: 'organization-1',
        logoAssetId: 'asset-1',
        name: 'Org',
        summary: 'Summary',
      },
      context
    );

    expect(context.loaders.categoriesByOrganizationId.load).toHaveBeenCalledWith(
      'organization-1'
    );
    expect(context.loaders.assetById.load).toHaveBeenCalledWith('asset-1');
  });

  it('loads donation project relations through request dataloaders', async () => {
    await donationProjectResolver.categories(
      {
        coverAssetId: 'asset-1',
        id: 'project-1',
        organizationId: 'organization-1',
        title: 'Project',
      },
      context
    );
    await donationProjectResolver.cover(
      {
        coverAssetId: 'asset-1',
        id: 'project-1',
        organizationId: 'organization-1',
        title: 'Project',
      },
      context
    );
    await donationProjectResolver.organization(
      {
        coverAssetId: 'asset-1',
        id: 'project-1',
        organizationId: 'organization-1',
        title: 'Project',
      },
      context
    );

    expect(
      context.loaders.categoriesByDonationProjectId.load
    ).toHaveBeenCalledWith('project-1');
    expect(context.loaders.assetById.load).toHaveBeenCalledWith('asset-1');
    expect(context.loaders.organizationById.load).toHaveBeenCalledWith(
      'organization-1'
    );
  });

  it('loads sale product relations through request dataloaders', async () => {
    await saleProductResolver.categories(
      {
        coverAssetId: 'asset-1',
        id: 'product-1',
        organizationId: 'organization-1',
        priceAmount: '100.00',
        title: 'Product',
      },
      context
    );
    await saleProductResolver.cover(
      {
        coverAssetId: 'asset-1',
        id: 'product-1',
        organizationId: 'organization-1',
        priceAmount: '100.00',
        title: 'Product',
      },
      context
    );
    await saleProductResolver.organization(
      {
        coverAssetId: 'asset-1',
        id: 'product-1',
        organizationId: 'organization-1',
        priceAmount: '100.00',
        title: 'Product',
      },
      context
    );

    expect(context.loaders.categoriesBySaleProductId.load).toHaveBeenCalledWith(
      'product-1'
    );
    expect(context.loaders.assetById.load).toHaveBeenCalledWith('asset-1');
    expect(context.loaders.organizationById.load).toHaveBeenCalledWith(
      'organization-1'
    );
  });
});
