import { DataSource } from 'typeorm';

import { AssetRepository } from './asset.repository';
import { CategoryRepository } from './category.repository';
import { DonationProjectRepository } from './donation-project.repository';
import { OrganizationRepository } from './organization.repository';
import { SaleProductRepository } from './sale-product.repository';

export interface CatalogRepositories {
  assetRepository: AssetRepository;
  categoryRepository: CategoryRepository;
  donationProjectRepository: DonationProjectRepository;
  organizationRepository: OrganizationRepository;
  saleProductRepository: SaleProductRepository;
}

export function createCatalogRepositories(
  dataSource: DataSource
): CatalogRepositories {
  return {
    assetRepository: new AssetRepository(dataSource),
    categoryRepository: new CategoryRepository(dataSource),
    donationProjectRepository: new DonationProjectRepository(dataSource),
    organizationRepository: new OrganizationRepository(dataSource),
    saleProductRepository: new SaleProductRepository(dataSource),
  };
}

export {
  AssetRepository,
  CategoryRepository,
  DonationProjectRepository,
  OrganizationRepository,
  SaleProductRepository,
};
