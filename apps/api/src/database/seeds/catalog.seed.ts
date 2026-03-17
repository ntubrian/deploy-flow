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

const ASSET_COUNT = 50;
const ORGANIZATION_COUNT = 50;
const DONATION_PROJECT_COUNT = 50;
const SALE_PRODUCT_COUNT = 50;
const ORGANIZATION_CATEGORY_COUNT = 60;
const PROJECT_CATEGORY_COUNT = 60;
const PRODUCT_CATEGORY_COUNT = 60;

const CATEGORY_NAMES = [
  '兒少照護',
  '動物保護',
  '特殊醫病',
  '老人照護',
  '身心障礙服務',
  '婦女關懷',
  '運動發展',
  '教育議題提倡',
  '環境保護',
  '多元族群',
  '媒體傳播',
  '公共議題',
  '文教藝術',
  '社區發展',
  '弱勢扶貧',
  '國際救援',
] as const;

const CATEGORY_COUNT = CATEGORY_NAMES.length;

const ORGANIZATION_PREFIXES = [
  '晨光',
  '海港',
  '遠山',
  '暖流',
  '微光',
  '田野',
  '築夢',
  '星火',
  '拾光',
  '和風',
] as const;

const ORGANIZATION_SUFFIXES = [
  '陪伴協會',
  '公益基金會',
  '地方創生聯盟',
  '社區支持中心',
  '永續行動社',
] as const;

const ORGANIZATION_MISSIONS = [
  '提供在地陪伴與支持服務',
  '串連志工、店家與社區資源',
  '協助弱勢家庭穩定生活節奏',
  '推動長期且可持續的公益計畫',
  '建立更有韌性的地方互助網絡',
] as const;

const PROJECT_FOCUSES = [
  '課後學習',
  '送餐陪伴',
  '社區據點',
  '環境教育',
  '家庭支持',
  '心理韌性',
  '長者健康',
  '地方共學',
  '青年培力',
  '就業準備',
] as const;

const PRODUCT_KEYWORDS = [
  '托特包',
  '濾掛咖啡',
  '保溫瓶',
  '筆記本',
  '手工皂',
  '茶葉禮盒',
  '帆布袋',
  '明信片組',
  '圍裙',
  '抱枕套',
] as const;

function createUuid(prefix: string, index: number): string {
  return `${prefix}-0000-0000-0000-${index.toString().padStart(12, '0')}`;
}

function createSequentialRows<Row>(
  count: number,
  map: (index: number) => Row
): Row[] {
  return Array.from({ length: count }, (_, zeroBasedIndex) => map(zeroBasedIndex + 1));
}

function createRelationshipRows(
  totalRows: number,
  ownerCount: number,
  categoryCount: number,
  createRow: (ownerIndex: number, categoryIndex: number) => {
    categoryId: string;
  }
): ReturnType<typeof createRow>[] {
  const rows: ReturnType<typeof createRow>[] = [];

  for (let ownerIndex = 1; ownerIndex <= ownerCount; ownerIndex += 1) {
    const categoryIndex = ((ownerIndex - 1) % categoryCount) + 1;
    rows.push(createRow(ownerIndex, categoryIndex));
  }

  for (
    let extraIndex = 1;
    rows.length < totalRows;
    extraIndex += 1
  ) {
    const ownerIndex = ((extraIndex - 1) % ownerCount) + 1;
    const categoryIndex = ((ownerIndex + extraIndex + 6) % categoryCount) + 1;
    const row = createRow(ownerIndex, categoryIndex);

    if (
      rows.some(
        (existingRow) =>
          JSON.stringify(existingRow) === JSON.stringify(row)
      )
    ) {
      continue;
    }

    rows.push(row);
  }

  return rows;
}

const seedAssets = createSequentialRows(ASSET_COUNT, (index) => ({
  altText: `Catalog asset ${index.toString().padStart(2, '0')}`,
  id: createUuid('11000000', index),
  url: `https://placehold.co/1200x800/png?text=Catalog+Asset+${index
    .toString()
    .padStart(2, '0')}`,
}));

const seedCategories = CATEGORY_NAMES.map((name, zeroBasedIndex) => ({
  id: createUuid('21000000', zeroBasedIndex + 1),
  name,
  sortOrder: zeroBasedIndex + 1,
}));

const seedOrganizations = createSequentialRows(ORGANIZATION_COUNT, (index) => {
  const prefix = ORGANIZATION_PREFIXES[(index - 1) % ORGANIZATION_PREFIXES.length];
  const suffix = ORGANIZATION_SUFFIXES[(index - 1) % ORGANIZATION_SUFFIXES.length];
  const mission = ORGANIZATION_MISSIONS[(index - 1) % ORGANIZATION_MISSIONS.length];

  return {
    id: createUuid('31000000', index),
    logoAssetId: createUuid('11000000', index),
    name: `${prefix}${suffix} ${index.toString().padStart(2, '0')}`,
    summary: `${mission}，聚焦於第 ${index
      .toString()
      .padStart(2, '0')} 個在地服務場域。`,
  };
});

const seedOrganizationCategories = createRelationshipRows(
  ORGANIZATION_CATEGORY_COUNT,
  ORGANIZATION_COUNT,
  CATEGORY_COUNT,
  (organizationIndex, categoryIndex) => ({
    categoryId: createUuid('21000000', categoryIndex),
    organizationId: createUuid('31000000', organizationIndex),
  })
);

const seedDonationProjects = createSequentialRows(DONATION_PROJECT_COUNT, (index) => {
  const focus = PROJECT_FOCUSES[(index - 1) % PROJECT_FOCUSES.length];

  return {
    coverAssetId: createUuid('11000000', ((index + 9) % ASSET_COUNT) + 1),
    id: createUuid('41000000', index),
    organizationId: createUuid('31000000', index),
    title: `${focus}計畫 ${index.toString().padStart(2, '0')}`,
  };
});

const seedProjectCategories = createRelationshipRows(
  PROJECT_CATEGORY_COUNT,
  DONATION_PROJECT_COUNT,
  CATEGORY_COUNT,
  (projectIndex, categoryIndex) => ({
    categoryId: createUuid('21000000', categoryIndex),
    donationProjectId: createUuid('41000000', projectIndex),
  })
);

const seedSaleProducts = createSequentialRows(SALE_PRODUCT_COUNT, (index) => {
  const keyword = PRODUCT_KEYWORDS[(index - 1) % PRODUCT_KEYWORDS.length];
  const priceAmount = (280 + index * 15).toFixed(2);

  return {
    coverAssetId: createUuid('11000000', ((index + 19) % ASSET_COUNT) + 1),
    id: createUuid('51000000', index),
    organizationId: createUuid('31000000', ((index + 14) % ORGANIZATION_COUNT) + 1),
    priceAmount,
    title: `${keyword} ${index.toString().padStart(2, '0')}`,
  };
});

const seedProductCategories = createRelationshipRows(
  PRODUCT_CATEGORY_COUNT,
  SALE_PRODUCT_COUNT,
  CATEGORY_COUNT,
  (productIndex, categoryIndex) => ({
    categoryId: createUuid('21000000', categoryIndex),
    saleProductId: createUuid('51000000', productIndex),
  })
);

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

async function deleteAllRows<Entity extends ObjectLiteral>(
  entityManager: EntityManager,
  entity: new () => Entity
): Promise<void> {
  await entityManager.createQueryBuilder().delete().from(entity).execute();
}

export async function seedCatalog(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (entityManager) => {
    await deleteAllRows(entityManager, ProductCategoryEntity);
    await deleteAllRows(entityManager, ProjectCategoryEntity);
    await deleteAllRows(entityManager, OrganizationCategoryEntity);
    await deleteAllRows(entityManager, SaleProductEntity);
    await deleteAllRows(entityManager, DonationProjectEntity);
    await deleteAllRows(entityManager, OrganizationEntity);
    await deleteAllRows(entityManager, CategoryEntity);
    await deleteAllRows(entityManager, AssetEntity);

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
  organizationCategories: seedOrganizationCategories.length,
  organizations: seedOrganizations.length,
  productCategories: seedProductCategories.length,
  projectCategories: seedProjectCategories.length,
  saleProducts: seedSaleProducts.length,
};
