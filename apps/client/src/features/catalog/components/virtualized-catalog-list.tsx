import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'

import {
  CatalogEmptyState,
  CatalogEndMarker,
  CatalogErrorState,
  CatalogSearchLoadingState,
  CatalogSpinner,
} from './catalog-primitives'

type LoadingMode = 'skeleton' | 'spinner'

interface VirtualizedCatalogListProps<Row> {
  emptyState?: React.ReactNode
  estimateSize: number
  footer?: React.ReactNode
  hasNextPage: boolean
  hasError?: boolean
  isFetchingMore: boolean
  isInitialLoading: boolean
  loadingMode?: LoadingMode
  onLoadMore: () => Promise<void> | void
  onRetry?: () => void
  renderRow: (row: Row, index: number) => React.ReactNode
  renderSkeletonRow: (index: number) => React.ReactNode
  rowClassName?: string
  rows: Row[]
  skeletonCount?: number
}

export function VirtualizedCatalogList<Row>({
  emptyState,
  estimateSize,
  footer,
  hasError = false,
  hasNextPage,
  isFetchingMore,
  isInitialLoading,
  loadingMode = 'skeleton',
  onLoadMore,
  onRetry,
  renderRow,
  renderSkeletonRow,
  rowClassName = '',
  rows,
  skeletonCount = 6,
}: VirtualizedCatalogListProps<Row>) {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const isLoadingMoreRef = useRef(false)
  const rowCount = hasNextPage ? rows.length + 1 : rows.length
  const virtualizer = useVirtualizer({
    count: rowCount,
    estimateSize: () => estimateSize,
    getScrollElement: () => scrollElementRef.current,
    overscan: 6,
  })
  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const lastVirtualItem = virtualItems.at(-1)

    if (
      lastVirtualItem &&
      hasNextPage &&
      !isFetchingMore &&
      rows.length > 0 &&
      lastVirtualItem.index >= rows.length &&
      !isLoadingMoreRef.current
    ) {
      isLoadingMoreRef.current = true
      void Promise.resolve(onLoadMore()).finally(() => {
        isLoadingMoreRef.current = false
      })
    }
  }, [hasNextPage, isFetchingMore, onLoadMore, rows.length, virtualItems])

  if (hasError && onRetry && !isInitialLoading && rows.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <CatalogErrorState onRetry={onRetry} />
      </div>
    )
  }

  if (isInitialLoading && rows.length === 0) {
    if (loadingMode === 'spinner') {
      return (
        <div className="flex-1 overflow-y-auto">
          <CatalogSearchLoadingState />
        </div>
      )
    }

    return (
      <div className="flex-1 overflow-y-auto px-[15px] pb-10 pt-3">
        <div className={rowClassName}>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <div key={index}>{renderSkeletonRow(index)}</div>
          ))}
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        {emptyState ?? <CatalogEmptyState />}
      </div>
    )
  }

  const footerOffset = footer ? 56 : 0

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      ref={scrollElementRef}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        className="relative px-[15px] pb-4 pt-3"
        style={{
          height: `${virtualizer.getTotalSize() + footerOffset}px`,
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= rows.length

          return (
            <div
              className={rowClassName}
              key={virtualItem.key}
              style={{
                left: 15,
                position: 'absolute',
                right: 15,
                top: 0,
                transform: `translateY(${virtualItem.start + 12}px)`,
              }}
            >
              {isLoaderRow ? (
                <div className="flex h-full items-center justify-center gap-2 py-4 text-[12px] font-medium text-black/35">
                  <CatalogSpinner className="h-4 w-4" />
                  <span>{isFetchingMore ? '載入中...' : '繼續滑動載入更多'}</span>
                </div>
              ) : (
                renderRow(rows[virtualItem.index], virtualItem.index)
              )}
            </div>
          )
        })}

        {footer ? (
          <div
            style={{
              left: 15,
              position: 'absolute',
              right: 15,
              top: virtualizer.getTotalSize() + 8,
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CatalogListFooter() {
  return <CatalogEndMarker />
}
