import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'

const CatalogPageClient = lazy(() =>
  import('../features/catalog/catalog-page-client').then((module) => ({
    default: module.CatalogPageClient,
  })),
)

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    setIsClientReady(true)
  }, [])

  if (!isClientReady) {
    return <div data-testid="catalog-client-boot" />
  }

  return (
    <Suspense fallback={<div data-testid="catalog-client-boot" />}>
      <CatalogPageClient />
    </Suspense>
  )
}
