import { Field, ID, Int, ObjectType } from 'type-graphql';

import { CursorConnection } from '../catalog/pagination';
import { AssetEntity } from '../database/entities/asset.entity';
import { CategoryEntity } from '../database/entities/category.entity';
import { DonationProjectEntity } from '../database/entities/donation-project.entity';
import { OrganizationEntity } from '../database/entities/organization.entity';
import { SaleProductEntity } from '../database/entities/sale-product.entity';

@ObjectType('PageInfo', {
  description: 'Shared metadata for cursor-based catalog lists.',
})
export class PageInfoGraphqlType {
  @Field(() => String, {
    description: 'Cursor for the final edge in this page. Use it as the next `after` value.',
    nullable: true,
  })
  endCursor!: string | null;

  @Field(() => Boolean, {
    description: 'Indicates whether another page exists after the current page.',
  })
  hasNextPage!: boolean;
}

@ObjectType('Asset')
export class AssetGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  altText!: string;

  @Field(() => String)
  url!: string;
}

@ObjectType('Category')
export class CategoryGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Int)
  sortOrder!: number;
}

@ObjectType('Organization')
export class OrganizationGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  summary!: string;

  logoAssetId!: string;
}

@ObjectType('OrganizationEdge')
export class OrganizationEdgeGraphqlType {
  @Field(() => String)
  cursor!: string;

  @Field(() => OrganizationGraphqlType)
  node!: OrganizationGraphqlType;
}

@ObjectType('OrganizationConnection')
export class OrganizationConnectionGraphqlType {
  @Field(() => [OrganizationEdgeGraphqlType])
  edges!: OrganizationEdgeGraphqlType[];

  @Field(() => PageInfoGraphqlType)
  pageInfo!: PageInfoGraphqlType;
}

@ObjectType('DonationProject')
export class DonationProjectGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  coverAssetId!: string;
  organizationId!: string;
}

@ObjectType('DonationProjectEdge')
export class DonationProjectEdgeGraphqlType {
  @Field(() => String)
  cursor!: string;

  @Field(() => DonationProjectGraphqlType)
  node!: DonationProjectGraphqlType;
}

@ObjectType('DonationProjectConnection')
export class DonationProjectConnectionGraphqlType {
  @Field(() => [DonationProjectEdgeGraphqlType])
  edges!: DonationProjectEdgeGraphqlType[];

  @Field(() => PageInfoGraphqlType)
  pageInfo!: PageInfoGraphqlType;
}

@ObjectType('SaleProduct')
export class SaleProductGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  priceAmount!: string;

  coverAssetId!: string;
  organizationId!: string;
}

@ObjectType('SaleProductEdge')
export class SaleProductEdgeGraphqlType {
  @Field(() => String)
  cursor!: string;

  @Field(() => SaleProductGraphqlType)
  node!: SaleProductGraphqlType;
}

@ObjectType('SaleProductConnection')
export class SaleProductConnectionGraphqlType {
  @Field(() => [SaleProductEdgeGraphqlType])
  edges!: SaleProductEdgeGraphqlType[];

  @Field(() => PageInfoGraphqlType)
  pageInfo!: PageInfoGraphqlType;
}

export function toAssetGraphqlType(asset: AssetEntity): AssetGraphqlType {
  return Object.assign(new AssetGraphqlType(), {
    altText: asset.altText,
    id: asset.id,
    url: asset.url,
  });
}

export function toCategoryGraphqlType(
  category: CategoryEntity
): CategoryGraphqlType {
  return Object.assign(new CategoryGraphqlType(), {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
  });
}

export function toOrganizationGraphqlType(
  organization: OrganizationEntity
): OrganizationGraphqlType {
  return Object.assign(new OrganizationGraphqlType(), {
    id: organization.id,
    logoAssetId: organization.logoAssetId,
    name: organization.name,
    summary: organization.summary,
  });
}

export function toDonationProjectGraphqlType(
  donationProject: DonationProjectEntity
): DonationProjectGraphqlType {
  return Object.assign(new DonationProjectGraphqlType(), {
    coverAssetId: donationProject.coverAssetId,
    id: donationProject.id,
    organizationId: donationProject.organizationId,
    title: donationProject.title,
  });
}

export function toSaleProductGraphqlType(
  saleProduct: SaleProductEntity
): SaleProductGraphqlType {
  return Object.assign(new SaleProductGraphqlType(), {
    coverAssetId: saleProduct.coverAssetId,
    id: saleProduct.id,
    organizationId: saleProduct.organizationId,
    priceAmount: saleProduct.priceAmount,
    title: saleProduct.title,
  });
}

export function toOrganizationConnectionGraphqlType(
  connection: CursorConnection<OrganizationEntity>
): OrganizationConnectionGraphqlType {
  return Object.assign(new OrganizationConnectionGraphqlType(), {
    edges: connection.edges.map((edge) =>
      Object.assign(new OrganizationEdgeGraphqlType(), {
        cursor: edge.cursor,
        node: toOrganizationGraphqlType(edge.node),
      })
    ),
    pageInfo: Object.assign(new PageInfoGraphqlType(), connection.pageInfo),
  });
}

export function toDonationProjectConnectionGraphqlType(
  connection: CursorConnection<DonationProjectEntity>
): DonationProjectConnectionGraphqlType {
  return Object.assign(new DonationProjectConnectionGraphqlType(), {
    edges: connection.edges.map((edge) =>
      Object.assign(new DonationProjectEdgeGraphqlType(), {
        cursor: edge.cursor,
        node: toDonationProjectGraphqlType(edge.node),
      })
    ),
    pageInfo: Object.assign(new PageInfoGraphqlType(), connection.pageInfo),
  });
}

export function toSaleProductConnectionGraphqlType(
  connection: CursorConnection<SaleProductEntity>
): SaleProductConnectionGraphqlType {
  return Object.assign(new SaleProductConnectionGraphqlType(), {
    edges: connection.edges.map((edge) =>
      Object.assign(new SaleProductEdgeGraphqlType(), {
        cursor: edge.cursor,
        node: toSaleProductGraphqlType(edge.node),
      })
    ),
    pageInfo: Object.assign(new PageInfoGraphqlType(), connection.pageInfo),
  });
}
