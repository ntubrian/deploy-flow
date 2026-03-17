import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { CategoryEntity } from './category.entity';
import { DonationProjectEntity } from './donation-project.entity';

@Entity({ name: 'project_categories' })
export class ProjectCategoryEntity {
  @ManyToOne(() => CategoryEntity, (category) => category.projectCategories, {
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
    () => DonationProjectEntity,
    (donationProject) => donationProject.projectCategories,
    {
      nullable: false,
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'donation_project_id' })
  donationProject!: DonationProjectEntity;

  @PrimaryColumn('uuid', { name: 'donation_project_id' })
  donationProjectId!: string;
}
