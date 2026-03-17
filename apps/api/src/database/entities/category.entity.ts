import { Column, Entity, Index, OneToMany } from 'typeorm';

import { TimestampedEntity } from './base.entity';
import { OrganizationCategoryEntity } from './organization-category.entity';
import { ProductCategoryEntity } from './product-category.entity';
import { ProjectCategoryEntity } from './project-category.entity';

@Entity({ name: 'categories' })
@Index('idx_categories_sort_order_id', ['sortOrder', 'id'])
export class CategoryEntity extends TimestampedEntity {
  @Column({ name: 'name', type: 'varchar', length: 120 })
  name!: string;

  @OneToMany(
    () => OrganizationCategoryEntity,
    (organizationCategory) => organizationCategory.category
  )
  organizationCategories!: OrganizationCategoryEntity[];

  @OneToMany(
    () => ProductCategoryEntity,
    (productCategory) => productCategory.category
  )
  productCategories!: ProductCategoryEntity[];

  @OneToMany(
    () => ProjectCategoryEntity,
    (projectCategory) => projectCategory.category
  )
  projectCategories!: ProjectCategoryEntity[];

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;
}
