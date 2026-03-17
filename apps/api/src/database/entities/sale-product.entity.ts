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
import { ProductCategoryEntity } from './product-category.entity';

@Entity({ name: 'sale_products' })
@Index('idx_sale_products_cover_asset_id', ['coverAssetId'])
@Index('idx_sale_products_organization_id', ['organizationId'])
export class SaleProductEntity extends TimestampedEntity {
  @Column({ name: 'cover_asset_id', type: 'uuid' })
  coverAssetId!: string;

  @ManyToOne(() => AssetEntity, (asset) => asset.saleProductCovers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cover_asset_id' })
  coverAsset!: AssetEntity;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.saleProducts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({
    name: 'price_amount',
    precision: 12,
    scale: 2,
    type: 'numeric',
  })
  priceAmount!: string;

  @OneToMany(
    () => ProductCategoryEntity,
    (productCategory) => productCategory.saleProduct
  )
  productCategories!: ProductCategoryEntity[];

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title!: string;
}
