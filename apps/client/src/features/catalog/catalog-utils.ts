import type {
  CatalogDonationProjectsQuery,
  CatalogOrganizationsQuery,
  CatalogSaleProductsQuery,
  CatalogSaleProductListItemFragment,
} from '../../graphql/generated'

export function formatTwdPrice(priceAmount: string): string {
  const parsed = Number.parseFloat(priceAmount)

  return `TWD ${new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(parsed) ? parsed : 0)}`
}

export function mergeConnectionEdges<Edge extends { cursor: string }>(
  previousEdges: readonly Edge[],
  nextEdges: readonly Edge[],
): Edge[] {
  const seenCursors = new Set(previousEdges.map((edge) => edge.cursor))

  return [
    ...previousEdges,
    ...nextEdges.filter((edge) => !seenCursors.has(edge.cursor)),
  ]
}

export function mergeOrganizationConnection(
  previous: CatalogOrganizationsQuery,
  next: CatalogOrganizationsQuery,
): CatalogOrganizationsQuery {
  return {
    ...next,
    organizations: {
      ...next.organizations,
      edges: mergeConnectionEdges(previous.organizations.edges, next.organizations.edges),
    },
  }
}

export function mergeDonationProjectConnection(
  previous: CatalogDonationProjectsQuery,
  next: CatalogDonationProjectsQuery,
): CatalogDonationProjectsQuery {
  return {
    ...next,
    donationProjects: {
      ...next.donationProjects,
      edges: mergeConnectionEdges(previous.donationProjects.edges, next.donationProjects.edges),
    },
  }
}

export function mergeSaleProductConnection(
  previous: CatalogSaleProductsQuery,
  next: CatalogSaleProductsQuery,
): CatalogSaleProductsQuery {
  return {
    ...next,
    saleProducts: {
      ...next.saleProducts,
      edges: mergeConnectionEdges(previous.saleProducts.edges, next.saleProducts.edges),
    },
  }
}

export function chunkSaleProductRows(
  products: readonly CatalogSaleProductListItemFragment[],
): CatalogSaleProductListItemFragment[][] {
  const rows: CatalogSaleProductListItemFragment[][] = []

  for (let index = 0; index < products.length; index += 2) {
    rows.push(products.slice(index, index + 2))
  }

  return rows
}
