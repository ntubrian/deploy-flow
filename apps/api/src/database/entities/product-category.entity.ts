import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { CategoryEntity } from './category.entity';
import { SaleProductEntity } from './sale-product.entity';

@Entity({ name: 'product_categories' })
@Index('idx_product_categories_category_sale_product', ['categoryId', 'saleProductId'])
export class ProductCategoryEntity {
  @ManyToOne(() => CategoryEntity, (category) => category.productCategories, {
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

  @ManyToOne(() => SaleProductEntity, (saleProduct) => saleProduct.productCategories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_product_id' })
  saleProduct!: SaleProductEntity;

  @PrimaryColumn('uuid', { name: 'sale_product_id' })
  saleProductId!: string;
}
