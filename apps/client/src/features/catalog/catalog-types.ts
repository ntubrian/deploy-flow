export const CATALOG_PAGE_SIZE = 12

export const catalogTabKeys = [
  'organizations',
  'donationProjects',
  'saleProducts',
] as const

export type CatalogTabKey = (typeof catalogTabKeys)[number]

export interface CatalogTabDefinition {
  key: CatalogTabKey
  label: string
}

export const catalogTabs: CatalogTabDefinition[] = [
  { key: 'organizations', label: '公益團體' },
  { key: 'donationProjects', label: '捐款專案' },
  { key: 'saleProducts', label: '義賣商品' },
]

export interface CatalogCategoryOption {
  id: string | null
  name: string
}
