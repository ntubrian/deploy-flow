import { Brackets, DataSource, Repository } from 'typeorm';

import { OrganizationEntity } from '../../database/entities/organization.entity';
import { ProductCategoryEntity } from '../../database/entities/product-category.entity';
import { SaleProductEntity } from '../../database/entities/sale-product.entity';
import {
  CatalogPageArguments,
  CursorConnection,
  applyCursorPagination,
  buildCursorConnection,
  decodeCursor,
  normalizeCategoryId,
  normalizeKeyword,
  resolvePageSize,
} from '../pagination';

export class SaleProductRepository {
  private readonly repository: Repository<SaleProductEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(SaleProductEntity);
  }

  async findConnection(
    args: CatalogPageArguments
  ): Promise<CursorConnection<SaleProductEntity>> {
    const pageSize = resolvePageSize(args.first);
    const cursor = decodeCursor(args.after);
    const categoryId = normalizeCategoryId(args.categoryId);
    const keyword = normalizeKeyword(args.keyword);
    const queryBuilder = this.repository.createQueryBuilder('saleProduct');

    queryBuilder
      .leftJoin(
        OrganizationEntity,
        'organizationFilter',
        'organizationFilter.id = saleProduct.organization_id'
      )
      .orderBy('saleProduct.created_at', 'DESC')
      .addOrderBy('saleProduct.id', 'DESC')
      .limit(pageSize + 1);

    applyCursorPagination(queryBuilder, 'saleProduct', cursor);

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((keywordQueryBuilder) => {
          keywordQueryBuilder
            .where('saleProduct.title ILIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('organizationFilter.name ILIKE :keyword', {
              keyword: `%${keyword}%`,
            });
        })
      );
    }

    if (categoryId) {
      queryBuilder.andWhere(
        (subQueryBuilder) =>
          `EXISTS ${subQueryBuilder
            .subQuery()
            .select('1')
            .from(ProductCategoryEntity, 'productCategory')
            .where('productCategory.sale_product_id = saleProduct.id')
            .andWhere('productCategory.category_id = :categoryId')
            .getQuery()}`,
        { categoryId }
      );
    }

    return buildCursorConnection(await queryBuilder.getMany(), pageSize);
  }
}
