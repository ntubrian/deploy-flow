import {
  DataSource,
  EntityManager,
  ObjectLiteral,
  QueryDeepPartialEntity,
} from 'typeorm';

import {
  AssetEntity,
  CategoryEntity,
  DonationProjectEntity,
  OrganizationCategoryEntity,
  OrganizationEntity,
  ProductCategoryEntity,
  ProjectCategoryEntity,
  SaleProductEntity,
} from '../entities';

const seedAssets = [
  {
    id: '11000000-0000-0000-0000-000000000001',
    altText: 'Light up Taiwan foundation logo',
    url: 'https://placehold.co/256x256/png?text=Light+Up+Taiwan',
  },
  {
    id: '11000000-0000-0000-0000-000000000002',
    altText: 'Harbor companion organization logo',
    url: 'https://placehold.co/256x256/png?text=Harbor+Companion',
  },
  {
    id: '11000000-0000-0000-0000-000000000003',
    altText: 'After school classroom cover',
    url: 'https://placehold.co/1200x800/png?text=After+School+Classroom',
  },
  {
    id: '11000000-0000-0000-0000-000000000004',
    altText: 'Community meal service cover',
    url: 'https://placehold.co/1200x800/png?text=Community+Meals',
  },
  {
    id: '11000000-0000-0000-0000-000000000005',
    altText: 'Eco tote bag product cover',
    url: 'https://placehold.co/1200x800/png?text=Eco+Tote+Bag',
  },
  {
    id: '11000000-0000-0000-0000-000000000006',
    altText: 'Coffee drip bag product cover',
    url: 'https://placehold.co/1200x800/png?text=Coffee+Drip+Bag',
  },
] as const;

const seedCategories = [
  {
    id: '21000000-0000-0000-0000-000000000001',
    name: '兒少支持',
    sortOrder: 1,
  },
  {
    id: '21000000-0000-0000-0000-000000000002',
    name: '長者照護',
    sortOrder: 2,
  },
  {
    id: '21000000-0000-0000-0000-000000000003',
    name: '社區共好',
    sortOrder: 3,
  },
  {
    id: '21000000-0000-0000-0000-000000000004',
    name: '永續生活',
    sortOrder: 4,
  },
] as const;

const seedOrganizations = [
  {
    id: '31000000-0000-0000-0000-000000000001',
    logoAssetId: '11000000-0000-0000-0000-000000000001',
    name: 'Light Up Taiwan',
    summary: '陪伴偏鄉孩子與家庭，提供課後支持與學習資源。',
  },
  {
    id: '31000000-0000-0000-0000-000000000002',
    logoAssetId: '11000000-0000-0000-0000-000000000002',
    name: 'Harbor Companion',
    summary: '串連社區志工與在地店家，提供長者陪伴與生活支援。',
  },
] as const;

const seedOrganizationCategories = [
  {
    categoryId: '21000000-0000-0000-0000-000000000001',
    organizationId: '31000000-0000-0000-0000-000000000001',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000003',
    organizationId: '31000000-0000-0000-0000-000000000001',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000002',
    organizationId: '31000000-0000-0000-0000-000000000002',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000003',
    organizationId: '31000000-0000-0000-0000-000000000002',
  },
] as const;

const seedDonationProjects = [
  {
    id: '41000000-0000-0000-0000-000000000001',
    coverAssetId: '11000000-0000-0000-0000-000000000003',
    organizationId: '31000000-0000-0000-0000-000000000001',
    title: '偏鄉課後學習計畫',
  },
  {
    id: '41000000-0000-0000-0000-000000000002',
    coverAssetId: '11000000-0000-0000-0000-000000000004',
    organizationId: '31000000-0000-0000-0000-000000000002',
    title: '社區送餐陪伴行動',
  },
] as const;

const seedProjectCategories = [
  {
    categoryId: '21000000-0000-0000-0000-000000000001',
    donationProjectId: '41000000-0000-0000-0000-000000000001',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000003',
    donationProjectId: '41000000-0000-0000-0000-000000000001',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000002',
    donationProjectId: '41000000-0000-0000-0000-000000000002',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000003',
    donationProjectId: '41000000-0000-0000-0000-000000000002',
  },
] as const;

const seedSaleProducts = [
  {
    id: '51000000-0000-0000-0000-000000000001',
    coverAssetId: '11000000-0000-0000-0000-000000000005',
    organizationId: '31000000-0000-0000-0000-000000000001',
    priceAmount: '680.00',
    title: '永續再生托特包',
  },
  {
    id: '51000000-0000-0000-0000-000000000002',
    coverAssetId: '11000000-0000-0000-0000-000000000006',
    organizationId: '31000000-0000-0000-0000-000000000002',
    priceAmount: '320.00',
    title: '暖心濾掛咖啡組',
  },
] as const;

const seedProductCategories = [
  {
    categoryId: '21000000-0000-0000-0000-000000000004',
    saleProductId: '51000000-0000-0000-0000-000000000001',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000003',
    saleProductId: '51000000-0000-0000-0000-000000000001',
  },
  {
    categoryId: '21000000-0000-0000-0000-000000000002',
    saleProductId: '51000000-0000-0000-0000-000000000002',
  },
] as const;

async function insertRelationshipRows<Entity extends ObjectLiteral>(
  entityManager: EntityManager,
  entity: new () => Entity,
  values: ReadonlyArray<QueryDeepPartialEntity<Entity>>
): Promise<void> {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(entity)
    .values([...values])
    .orIgnore()
    .execute();
}

export async function seedCatalog(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (entityManager) => {
    await entityManager.getRepository(AssetEntity).upsert([...seedAssets], ['id']);
    await entityManager.getRepository(CategoryEntity).upsert([...seedCategories], ['id']);
    await entityManager
      .getRepository(OrganizationEntity)
      .upsert([...seedOrganizations], ['id']);
    await entityManager
      .getRepository(DonationProjectEntity)
      .upsert([...seedDonationProjects], ['id']);
    await entityManager
      .getRepository(SaleProductEntity)
      .upsert([...seedSaleProducts], ['id']);
    await insertRelationshipRows(
      entityManager,
      OrganizationCategoryEntity,
      seedOrganizationCategories
    );
    await insertRelationshipRows(
      entityManager,
      ProjectCategoryEntity,
      seedProjectCategories
    );
    await insertRelationshipRows(
      entityManager,
      ProductCategoryEntity,
      seedProductCategories
    );
  });
}

export const demoCatalogSeedCounts = {
  assets: seedAssets.length,
  categories: seedCategories.length,
  donationProjects: seedDonationProjects.length,
  organizations: seedOrganizations.length,
  productCategories: seedProductCategories.length,
  projectCategories: seedProjectCategories.length,
  saleProducts: seedSaleProducts.length,
};
