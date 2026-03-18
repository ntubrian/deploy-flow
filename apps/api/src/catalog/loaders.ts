import DataLoader from 'dataloader';

import { AssetEntity } from '../database/entities/asset.entity';
import { CategoryEntity } from '../database/entities/category.entity';
import { OrganizationEntity } from '../database/entities/organization.entity';

import type { CatalogRepositories } from './repositories';

export interface CatalogLoaders {
  assetById: DataLoader<string, AssetEntity>;
  categoriesByDonationProjectId: DataLoader<string, CategoryEntity[]>;
  categoriesByOrganizationId: DataLoader<string, CategoryEntity[]>;
  categoriesBySaleProductId: DataLoader<string, CategoryEntity[]>;
  organizationById: DataLoader<string, OrganizationEntity>;
}

function mapById<TNode extends { id: string }>(
  keys: readonly string[],
  nodes: readonly TNode[],
  entityLabel: string
): TNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return keys.map((key) => {
    const node = nodeMap.get(key);

    if (!node) {
      throw new Error(`${entityLabel} ${key} was not found.`);
    }

    return node;
  });
}

export function createCatalogLoaders(
  repositories: CatalogRepositories
): CatalogLoaders {
  return {
    assetById: new DataLoader<string, AssetEntity>(async (assetIds) =>
      mapById(assetIds, await repositories.assetRepository.findByIds(assetIds), 'Asset')
    ),
    categoriesByDonationProjectId: new DataLoader<string, CategoryEntity[]>(
      async (donationProjectIds) => {
        const groupedCategories =
          await repositories.categoryRepository.findByDonationProjectIds(
            donationProjectIds
          );

        return donationProjectIds.map(
          (donationProjectId) => groupedCategories.get(donationProjectId) ?? []
        );
      }
    ),
    categoriesByOrganizationId: new DataLoader<string, CategoryEntity[]>(
      async (organizationIds) => {
        const groupedCategories =
          await repositories.categoryRepository.findByOrganizationIds(organizationIds);

        return organizationIds.map(
          (organizationId) => groupedCategories.get(organizationId) ?? []
        );
      }
    ),
    categoriesBySaleProductId: new DataLoader<string, CategoryEntity[]>(
      async (saleProductIds) => {
        const groupedCategories =
          await repositories.categoryRepository.findBySaleProductIds(saleProductIds);

        return saleProductIds.map(
          (saleProductId) => groupedCategories.get(saleProductId) ?? []
        );
      }
    ),
    organizationById: new DataLoader<string, OrganizationEntity>(
      async (organizationIds) =>
        mapById(
          organizationIds,
          await repositories.organizationRepository.findByIds(organizationIds),
          'Organization'
        )
    ),
  };
}
