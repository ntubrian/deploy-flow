import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function resolveGraphqlEndpoint(): string {
  const configuredEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT

  if (configuredEndpoint) {
    return configuredEndpoint
  }

  if (typeof window !== 'undefined' && !isLocalHostname(window.location.hostname)) {
    return '/api/graphql'
  }

  return 'http://localhost:3000/api/graphql'
}

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    credentials: 'include',
    uri: resolveGraphqlEndpoint(),
  }),
  ssrMode: typeof window === 'undefined',
})
