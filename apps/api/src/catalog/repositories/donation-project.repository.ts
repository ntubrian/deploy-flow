import { Brackets, DataSource, Repository } from 'typeorm';

import { DonationProjectEntity } from '../../database/entities/donation-project.entity';
import { OrganizationEntity } from '../../database/entities/organization.entity';
import { ProjectCategoryEntity } from '../../database/entities/project-category.entity';
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

export class DonationProjectRepository {
  private readonly repository: Repository<DonationProjectEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(DonationProjectEntity);
  }

  async findConnection(
    args: CatalogPageArguments
  ): Promise<CursorConnection<DonationProjectEntity>> {
    const pageSize = resolvePageSize(args.first);
    const cursor = decodeCursor(args.after);
    const categoryId = normalizeCategoryId(args.categoryId);
    const keyword = normalizeKeyword(args.keyword);
    const queryBuilder = this.repository.createQueryBuilder('donationProject');

    queryBuilder
      .leftJoin(
        OrganizationEntity,
        'organizationFilter',
        'organizationFilter.id = donationProject.organization_id'
      )
      .addSelect(
        buildPreciseCursorTimestampSelect('donationProject'),
        'cursor_created_at'
      )
      .orderBy('donationProject.created_at', 'DESC')
      .addOrderBy('donationProject.id', 'DESC')
      .limit(pageSize + 1);

    applyCursorPagination(queryBuilder, 'donationProject', cursor);

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((keywordQueryBuilder) => {
          keywordQueryBuilder
            .where('donationProject.title ILIKE :keyword', {
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
            .from(ProjectCategoryEntity, 'projectCategory')
            .where(
              'projectCategory.donation_project_id = donationProject.id'
            )
            .andWhere('projectCategory.category_id = :categoryId')
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
