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
import { DonationProjectEntity } from './donation-project.entity';
import { OrganizationCategoryEntity } from './organization-category.entity';
import { SaleProductEntity } from './sale-product.entity';

@Entity({ name: 'organizations' })
@Index('idx_organizations_logo_asset_id', ['logoAssetId'])
export class OrganizationEntity extends TimestampedEntity {
  @OneToMany(
    () => DonationProjectEntity,
    (donationProject) => donationProject.organization
  )
  donationProjects!: DonationProjectEntity[];

  @Column({ name: 'logo_asset_id', type: 'uuid' })
  logoAssetId!: string;

  @ManyToOne(() => AssetEntity, (asset) => asset.organizationLogos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'logo_asset_id' })
  logoAsset!: AssetEntity;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @OneToMany(
    () => OrganizationCategoryEntity,
    (organizationCategory) => organizationCategory.organization
  )
  organizationCategories!: OrganizationCategoryEntity[];

  @OneToMany(() => SaleProductEntity, (saleProduct) => saleProduct.organization)
  saleProducts!: SaleProductEntity[];

  @Column({ name: 'summary', type: 'text' })
  summary!: string;
}
