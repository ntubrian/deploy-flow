import { Column, Entity, OneToMany } from 'typeorm';

import { CreatedAtEntity } from './base.entity';
import { DonationProjectEntity } from './donation-project.entity';
import { OrganizationEntity } from './organization.entity';
import { SaleProductEntity } from './sale-product.entity';

@Entity({ name: 'assets' })
export class AssetEntity extends CreatedAtEntity {
  @Column({ name: 'alt_text', type: 'varchar', length: 255 })
  altText!: string;

  @OneToMany(() => DonationProjectEntity, (donationProject) => donationProject.coverAsset)
  donationProjectCovers!: DonationProjectEntity[];

  @OneToMany(() => OrganizationEntity, (organization) => organization.logoAsset)
  organizationLogos!: OrganizationEntity[];

  @OneToMany(() => SaleProductEntity, (saleProduct) => saleProduct.coverAsset)
  saleProductCovers!: SaleProductEntity[];

  @Column({ name: 'url', type: 'varchar', length: 2048 })
  url!: string;
}
