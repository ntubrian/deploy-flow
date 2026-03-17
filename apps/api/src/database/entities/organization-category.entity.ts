import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { CategoryEntity } from './category.entity';
import { OrganizationEntity } from './organization.entity';

@Entity({ name: 'organization_categories' })
export class OrganizationCategoryEntity {
  @ManyToOne(() => CategoryEntity, (category) => category.organizationCategories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;

  @PrimaryColumn('uuid', { name: 'category_id' })
  categoryId!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ManyToOne(
    () => OrganizationEntity,
    (organization) => organization.organizationCategories,
    {
      nullable: false,
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @PrimaryColumn('uuid', { name: 'organization_id' })
  organizationId!: string;
}
