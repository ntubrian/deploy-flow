import { ApolloProvider } from '@apollo/client/react'

import { CatalogPage } from './catalog-page'
import { apolloClient } from '../../lib/graphql/apollo-client'

export function CatalogPageClient() {
  return (
    <ApolloProvider client={apolloClient}>
      <CatalogPage />
    </ApolloProvider>
  )
}
