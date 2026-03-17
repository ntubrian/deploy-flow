import { AssetEntity } from './asset.entity';
import { CategoryEntity } from './category.entity';
import { DonationProjectEntity } from './donation-project.entity';
import { OrganizationCategoryEntity } from './organization-category.entity';
import { OrganizationEntity } from './organization.entity';
import { ProductCategoryEntity } from './product-category.entity';
import { ProjectCategoryEntity } from './project-category.entity';
import { SaleProductEntity } from './sale-product.entity';

export const catalogEntities = [
  AssetEntity,
  CategoryEntity,
  DonationProjectEntity,
  OrganizationCategoryEntity,
  OrganizationEntity,
  ProductCategoryEntity,
  ProjectCategoryEntity,
  SaleProductEntity,
] as const;

export {
  AssetEntity,
  CategoryEntity,
  DonationProjectEntity,
  OrganizationCategoryEntity,
  OrganizationEntity,
  ProductCategoryEntity,
  ProjectCategoryEntity,
  SaleProductEntity,
};
