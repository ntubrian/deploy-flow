import { DataSource, In, Repository } from 'typeorm';

import { CategoryEntity } from '../../database/entities/category.entity';
import { OrganizationCategoryEntity } from '../../database/entities/organization-category.entity';
import { ProductCategoryEntity } from '../../database/entities/product-category.entity';
import { ProjectCategoryEntity } from '../../database/entities/project-category.entity';

type CategoryGroupMap = Map<string, CategoryEntity[]>;

export class CategoryRepository {
  private readonly categoryRepository: Repository<CategoryEntity>;

  private readonly organizationCategoryRepository: Repository<OrganizationCategoryEntity>;

  private readonly productCategoryRepository: Repository<ProductCategoryEntity>;

  private readonly projectCategoryRepository: Repository<ProjectCategoryEntity>;

  constructor(dataSource: DataSource) {
    this.categoryRepository = dataSource.getRepository(CategoryEntity);
    this.organizationCategoryRepository =
      dataSource.getRepository(OrganizationCategoryEntity);
    this.productCategoryRepository = dataSource.getRepository(ProductCategoryEntity);
    this.projectCategoryRepository = dataSource.getRepository(ProjectCategoryEntity);
  }

  async findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      order: {
        id: 'ASC',
        sortOrder: 'ASC',
      },
    });
  }

  async findByDonationProjectIds(
    donationProjectIds: readonly string[]
  ): Promise<CategoryGroupMap> {
    if (donationProjectIds.length === 0) {
      return new Map();
    }

    const projectCategories = await this.projectCategoryRepository
      .createQueryBuilder('projectCategory')
      .innerJoinAndSelect('projectCategory.category', 'category')
      .where('projectCategory.donation_project_id IN (:...donationProjectIds)', {
        donationProjectIds: [...donationProjectIds],
      })
      .orderBy('category.sort_order', 'ASC')
      .addOrderBy('category.id', 'ASC')
      .getMany();

    return this.groupCategories(
      donationProjectIds,
      projectCategories.map((projectCategory) => ({
        category: projectCategory.category,
        ownerId: projectCategory.donationProjectId,
      }))
    );
  }

  async findByOrganizationIds(
    organizationIds: readonly string[]
  ): Promise<CategoryGroupMap> {
    if (organizationIds.length === 0) {
      return new Map();
    }

    const organizationCategories = await this.organizationCategoryRepository
      .createQueryBuilder('organizationCategory')
      .innerJoinAndSelect('organizationCategory.category', 'category')
      .where('organizationCategory.organization_id IN (:...organizationIds)', {
        organizationIds: [...organizationIds],
      })
      .orderBy('category.sort_order', 'ASC')
      .addOrderBy('category.id', 'ASC')
      .getMany();

    return this.groupCategories(
      organizationIds,
      organizationCategories.map((organizationCategory) => ({
        category: organizationCategory.category,
        ownerId: organizationCategory.organizationId,
      }))
    );
  }

  async findBySaleProductIds(
    saleProductIds: readonly string[]
  ): Promise<CategoryGroupMap> {
    if (saleProductIds.length === 0) {
      return new Map();
    }

    const productCategories = await this.productCategoryRepository
      .createQueryBuilder('productCategory')
      .innerJoinAndSelect('productCategory.category', 'category')
      .where('productCategory.sale_product_id IN (:...saleProductIds)', {
        saleProductIds: [...saleProductIds],
      })
      .orderBy('category.sort_order', 'ASC')
      .addOrderBy('category.id', 'ASC')
      .getMany();

    return this.groupCategories(
      saleProductIds,
      productCategories.map((productCategory) => ({
        category: productCategory.category,
        ownerId: productCategory.saleProductId,
      }))
    );
  }

  async findByIds(ids: readonly string[]): Promise<CategoryEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.categoryRepository.findBy({
      id: In([...ids]),
    });
  }

  private groupCategories(
    ownerIds: readonly string[],
    rows: Array<{ category: CategoryEntity; ownerId: string }>
  ): CategoryGroupMap {
    const groupedCategories = new Map<string, CategoryEntity[]>(
      ownerIds.map((ownerId) => [ownerId, []])
    );

    for (const row of rows) {
      groupedCategories.get(row.ownerId)?.push(row.category);
    }

    return groupedCategories;
  }
}
