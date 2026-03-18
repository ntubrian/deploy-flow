import { NetworkStatus } from '@apollo/client'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { startTransition, useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

import {
  CATALOG_PAGE_SIZE,
  catalogTabKeys,
  catalogTabs,
  type CatalogCategoryOption,
  type CatalogTabKey,
} from './catalog-types'
import {
  chunkSaleProductRows,
  mergeDonationProjectConnection,
  mergeOrganizationConnection,
  mergeSaleProductConnection,
} from './catalog-utils'
import {
  DonationProjectCard,
  DonationProjectCardSkeleton,
  OrganizationCard,
  OrganizationCardSkeleton,
  SaleProductCard,
  SaleProductCardSkeleton,
} from './components/catalog-cards'
import {
  CatalogCategoryModal,
  CatalogCompactControls,
  CatalogExpandedSearchBar,
  CatalogHeader,
  CatalogMobileShell,
  CatalogTabs,
} from './components/catalog-primitives'
import {
  CatalogListFooter,
  VirtualizedCatalogList,
} from './components/virtualized-catalog-list'
import {
  type CatalogDonationProjectListItemFragment,
  type CatalogOrganizationListItemFragment,
  type CatalogSaleProductListItemFragment,
  useCatalogCategoriesQuery,
  useCatalogDonationProjectsQuery,
  useCatalogOrganizationsQuery,
  useCatalogSaleProductsQuery,
} from '../../graphql/generated'

interface CatalogSectionProps {
  categoryId: string | null
  keyword: string
  searchVisible: boolean
}

function buildConnectionVariables(
  keyword: string,
  categoryId: string | null,
  after?: string | null,
) {
  const normalizedKeyword = keyword.trim()

  return {
    after: after ?? undefined,
    categoryId: categoryId ?? undefined,
    first: CATALOG_PAGE_SIZE,
    keyword: normalizedKeyword || undefined,
  }
}

function OrganizationsSection({
  categoryId,
  keyword,
  searchVisible,
}: CatalogSectionProps) {
  const variables = buildConnectionVariables(keyword, categoryId)
  const { data, error, fetchMore, loading, networkStatus, refetch } =
    useCatalogOrganizationsQuery({
      notifyOnNetworkStatusChange: true,
      variables,
    })
  const connection = data?.organizations
  const items = connection?.edges.map((edge) => edge.node) ?? []

  async function loadMore() {
    if (
      !connection?.pageInfo.endCursor ||
      !connection.pageInfo.hasNextPage ||
      networkStatus === NetworkStatus.fetchMore
    ) {
      return
    }

    await fetchMore({
      updateQuery: (previousQueryResult, { fetchMoreResult }) =>
        fetchMoreResult
          ? mergeOrganizationConnection(previousQueryResult, fetchMoreResult)
          : previousQueryResult,
      variables: buildConnectionVariables(
        keyword,
        categoryId,
        connection.pageInfo.endCursor,
      ),
    })
  }

  return (
    <VirtualizedCatalogList<CatalogOrganizationListItemFragment>
      emptyState={undefined}
      estimateSize={96}
      footer={!connection?.pageInfo.hasNextPage ? <CatalogListFooter /> : undefined}
      hasError={Boolean(error)}
      hasNextPage={connection?.pageInfo.hasNextPage ?? false}
      isFetchingMore={networkStatus === NetworkStatus.fetchMore}
      isInitialLoading={loading && items.length === 0}
      loadingMode={searchVisible && Boolean(keyword) ? 'spinner' : 'skeleton'}
      onLoadMore={loadMore}
      onRetry={() => {
        void refetch(variables)
      }}
      renderRow={(item) => <OrganizationCard item={item} />}
      renderSkeletonRow={(index) => <OrganizationCardSkeleton key={index} />}
      rows={items}
      skeletonCount={8}
    />
  )
}

function DonationProjectsSection({
  categoryId,
  keyword,
  searchVisible,
}: CatalogSectionProps) {
  const variables = buildConnectionVariables(keyword, categoryId)
  const { data, error, fetchMore, loading, networkStatus, refetch } =
    useCatalogDonationProjectsQuery({
      notifyOnNetworkStatusChange: true,
      variables,
    })
  const connection = data?.donationProjects
  const items = connection?.edges.map((edge) => edge.node) ?? []

  async function loadMore() {
    if (
      !connection?.pageInfo.endCursor ||
      !connection.pageInfo.hasNextPage ||
      networkStatus === NetworkStatus.fetchMore
    ) {
      return
    }

    await fetchMore({
      updateQuery: (previousQueryResult, { fetchMoreResult }) =>
        fetchMoreResult
          ? mergeDonationProjectConnection(previousQueryResult, fetchMoreResult)
          : previousQueryResult,
      variables: buildConnectionVariables(
        keyword,
        categoryId,
        connection.pageInfo.endCursor,
      ),
    })
  }

  return (
    <VirtualizedCatalogList<CatalogDonationProjectListItemFragment>
      estimateSize={276}
      footer={!connection?.pageInfo.hasNextPage ? <CatalogListFooter /> : undefined}
      hasError={Boolean(error)}
      hasNextPage={connection?.pageInfo.hasNextPage ?? false}
      isFetchingMore={networkStatus === NetworkStatus.fetchMore}
      isInitialLoading={loading && items.length === 0}
      loadingMode={searchVisible && Boolean(keyword) ? 'spinner' : 'skeleton'}
      onLoadMore={loadMore}
      onRetry={() => {
        void refetch(variables)
      }}
      rowClassName="pb-3"
      renderRow={(item) => <DonationProjectCard item={item} />}
      renderSkeletonRow={(index) => (
        <DonationProjectCardSkeleton key={index} />
      )}
      rows={items}
      skeletonCount={4}
    />
  )
}

function SaleProductsSection({
  categoryId,
  keyword,
  searchVisible,
}: CatalogSectionProps) {
  const variables = buildConnectionVariables(keyword, categoryId)
  const { data, error, fetchMore, loading, networkStatus, refetch } =
    useCatalogSaleProductsQuery({
      notifyOnNetworkStatusChange: true,
      variables,
    })
  const connection = data?.saleProducts
  const items = connection?.edges.map((edge) => edge.node) ?? []
  const rows = chunkSaleProductRows(items)

  async function loadMore() {
    if (
      !connection?.pageInfo.endCursor ||
      !connection.pageInfo.hasNextPage ||
      networkStatus === NetworkStatus.fetchMore
    ) {
      return
    }

    await fetchMore({
      updateQuery: (previousQueryResult, { fetchMoreResult }) =>
        fetchMoreResult
          ? mergeSaleProductConnection(previousQueryResult, fetchMoreResult)
          : previousQueryResult,
      variables: buildConnectionVariables(
        keyword,
        categoryId,
        connection.pageInfo.endCursor,
      ),
    })
  }

  return (
    <VirtualizedCatalogList<CatalogSaleProductListItemFragment[]>
      estimateSize={226}
      footer={!connection?.pageInfo.hasNextPage ? <CatalogListFooter /> : undefined}
      hasError={Boolean(error)}
      hasNextPage={connection?.pageInfo.hasNextPage ?? false}
      isFetchingMore={networkStatus === NetworkStatus.fetchMore}
      isInitialLoading={loading && rows.length === 0}
      loadingMode={searchVisible && Boolean(keyword) ? 'spinner' : 'skeleton'}
      onLoadMore={loadMore}
      onRetry={() => {
        void refetch(variables)
      }}
      renderRow={(row) => (
        <div className="grid grid-cols-2 gap-x-3">
          {row.map((item) => (
            <SaleProductCard item={item} key={item.id} />
          ))}
          {row.length === 1 ? <div aria-hidden="true" /> : null}
        </div>
      )}
      renderSkeletonRow={(index) => (
        <div className="grid grid-cols-2 gap-x-3" key={index}>
          <SaleProductCardSkeleton />
          <SaleProductCardSkeleton />
        </div>
      )}
      rows={rows}
      skeletonCount={4}
    />
  )
}

export function CatalogPage() {
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringLiteral(catalogTabKeys)
      .withDefault('organizations')
      .withOptions({
        clearOnDefault: true,
        history: 'push',
      }),
  )
  const [isCategoryModalMounted, setIsCategoryModalMounted] = useState(false)
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const categoryCloseTimeoutRef = useRef<number | null>(null)
  const categoryUnmountTimeoutRef = useRef<number | null>(null)
  const [debouncedKeyword] = useDebounce(keywordInput, 250)
  const categoriesQuery = useCatalogCategoriesQuery({
    fetchPolicy: 'cache-first',
  })
  const categories = categoriesQuery.data?.categories ?? []
  const searchVisible = isSearchOpen || keywordInput.length > 0
  const categoryOptions: CatalogCategoryOption[] = [
    { id: null, name: '全部' },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  ]
  const selectedCategoryLabel =
    categories.find((category) => category.id === selectedCategoryId)?.name ?? '全部'

  useEffect(() => {
    if (searchVisible) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus({
          preventScroll: true,
        })
      })
    }
  }, [searchVisible])

  useEffect(() => {
    return () => {
      if (categoryCloseTimeoutRef.current !== null) {
        window.clearTimeout(categoryCloseTimeoutRef.current)
      }

      if (categoryUnmountTimeoutRef.current !== null) {
        window.clearTimeout(categoryUnmountTimeoutRef.current)
      }
    }
  }, [])

  function handleTabChange(nextTab: CatalogTabKey) {
    startTransition(() => {
      void setActiveTab(nextTab)
    })
  }

  function handleOpenCategoryModal() {
    if (categoryUnmountTimeoutRef.current !== null) {
      window.clearTimeout(categoryUnmountTimeoutRef.current)
      categoryUnmountTimeoutRef.current = null
    }

    setIsCategoryModalMounted(true)
    requestAnimationFrame(() => {
      setIsCategoryModalVisible(true)
    })
  }

  function handleCloseCategoryModal() {
    if (categoryCloseTimeoutRef.current !== null) {
      window.clearTimeout(categoryCloseTimeoutRef.current)
      categoryCloseTimeoutRef.current = null
    }

    if (categoryUnmountTimeoutRef.current !== null) {
      window.clearTimeout(categoryUnmountTimeoutRef.current)
    }

    setIsCategoryModalVisible(false)
    categoryUnmountTimeoutRef.current = window.setTimeout(() => {
      setIsCategoryModalMounted(false)
      categoryUnmountTimeoutRef.current = null
    }, 220)
  }

  function handleSelectCategory(categoryId: string | null) {
    if (selectedCategoryId === categoryId) {
      return
    }

    if (categoryCloseTimeoutRef.current !== null) {
      window.clearTimeout(categoryCloseTimeoutRef.current)
    }

    startTransition(() => {
      setSelectedCategoryId(categoryId)
    })

    categoryCloseTimeoutRef.current = window.setTimeout(() => {
      categoryCloseTimeoutRef.current = null
      handleCloseCategoryModal()
    }, 500)
  }

  function handleCancelSearch() {
    setKeywordInput('')
    setIsSearchOpen(false)
  }

  let section: React.ReactNode = null

  if (activeTab === 'organizations') {
    section = (
      <OrganizationsSection
        categoryId={selectedCategoryId}
        keyword={debouncedKeyword}
        searchVisible={searchVisible}
      />
    )
  } else if (activeTab === 'donationProjects') {
    section = (
      <DonationProjectsSection
        categoryId={selectedCategoryId}
        keyword={debouncedKeyword}
        searchVisible={searchVisible}
      />
    )
  } else {
    section = (
      <SaleProductsSection
        categoryId={selectedCategoryId}
        keyword={debouncedKeyword}
        searchVisible={searchVisible}
      />
    )
  }

  return (
    <CatalogMobileShell>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <CatalogHeader />
        {searchVisible ? (
          <CatalogExpandedSearchBar
            inputRef={searchInputRef}
            onCancel={handleCancelSearch}
            onChange={setKeywordInput}
            value={keywordInput}
          />
        ) : null}

        <CatalogTabs
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={catalogTabs}
        />

        {!searchVisible ? (
          <CatalogCompactControls
            categoryLabel={selectedCategoryLabel}
            onOpenCategoryModal={handleOpenCategoryModal}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        ) : null}

        {section}

        {isCategoryModalMounted ? (
          <CatalogCategoryModal
            categories={categoryOptions}
            isVisible={isCategoryModalVisible}
            onClose={handleCloseCategoryModal}
            onSelect={handleSelectCategory}
            selectedCategoryId={selectedCategoryId}
          />
        ) : null}
      </div>
    </CatalogMobileShell>
  )
}
