import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AssetEntity } from './asset.entity';
import { TimestampedEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { ProjectCategoryEntity } from './project-category.entity';

@Entity({ name: 'donation_projects' })
@Index('idx_donation_projects_cover_asset_id', ['coverAssetId'])
@Index('idx_donation_projects_organization_id', ['organizationId'])
export class DonationProjectEntity extends TimestampedEntity {
  @Column({ name: 'cover_asset_id', type: 'uuid' })
  coverAssetId!: string;

  @ManyToOne(() => AssetEntity, (asset) => asset.donationProjectCovers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cover_asset_id' })
  coverAsset!: AssetEntity;

  @ManyToOne(
    () => OrganizationEntity,
    (organization) => organization.donationProjects,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    }
  )
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @OneToMany(
    () => ProjectCategoryEntity,
    (projectCategory) => projectCategory.donationProject
  )
  projectCategories!: ProjectCategoryEntity[];

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title!: string;
}
