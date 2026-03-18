import { Brackets, DataSource, In, Repository } from 'typeorm';

import { OrganizationCategoryEntity } from '../../database/entities/organization-category.entity';
import { OrganizationEntity } from '../../database/entities/organization.entity';
import {
  CatalogPageArguments,
  CursorConnection,
  applyCursorPagination,
  buildCursorConnection,
  buildPreciseCursorTimestampSelect,
  decodeCursor,
  normalizeCategoryId,
  normalizeKeyword,
  resolvePageSize,
} from '../pagination';

export class OrganizationRepository {
  private readonly repository: Repository<OrganizationEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(OrganizationEntity);
  }

  async findByIds(ids: readonly string[]): Promise<OrganizationEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.repository.findBy({
      id: In([...ids]),
    });
  }

  async findConnection(
    args: CatalogPageArguments
  ): Promise<CursorConnection<OrganizationEntity>> {
    const pageSize = resolvePageSize(args.first);
    const cursor = decodeCursor(args.after);
    const categoryId = normalizeCategoryId(args.categoryId);
    const keyword = normalizeKeyword(args.keyword);
    const queryBuilder = this.repository.createQueryBuilder('organization');

    queryBuilder
      .addSelect(
        buildPreciseCursorTimestampSelect('organization'),
        'cursor_created_at'
      )
      .orderBy('organization.created_at', 'DESC')
      .addOrderBy('organization.id', 'DESC')
      .limit(pageSize + 1);

    applyCursorPagination(queryBuilder, 'organization', cursor);

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((keywordQueryBuilder) => {
          keywordQueryBuilder
            .where('organization.name ILIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('organization.summary ILIKE :keyword', {
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
            .from(OrganizationCategoryEntity, 'organizationCategory')
            .where('organizationCategory.organization_id = organization.id')
            .andWhere('organizationCategory.category_id = :categoryId')
            .getQuery()}`,
        { categoryId }
      );
    }

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    return buildCursorConnection(
      entities.map((entity, index) => ({
        cursor: {
          createdAt: raw[index]?.cursor_created_at,
          id: entity.id,
        },
        node: entity,
      })),
      pageSize
    );
  }
}
