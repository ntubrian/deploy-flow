import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Asset = {
  __typename?: 'Asset';
  altText: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type DonationProject = {
  __typename?: 'DonationProject';
  categories: Array<Category>;
  cover: Asset;
  id: Scalars['ID']['output'];
  organization: Organization;
  title: Scalars['String']['output'];
};

export type DonationProjectConnection = {
  __typename?: 'DonationProjectConnection';
  edges: Array<DonationProjectEdge>;
  pageInfo: PageInfo;
};

export type DonationProjectEdge = {
  __typename?: 'DonationProjectEdge';
  cursor: Scalars['String']['output'];
  node: DonationProject;
};

export type Organization = {
  __typename?: 'Organization';
  categories: Array<Category>;
  id: Scalars['ID']['output'];
  logo: Asset;
  name: Scalars['String']['output'];
  summary: Scalars['String']['output'];
};

export type OrganizationConnection = {
  __typename?: 'OrganizationConnection';
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
};

export type OrganizationEdge = {
  __typename?: 'OrganizationEdge';
  cursor: Scalars['String']['output'];
  node: Organization;
};

/** Shared metadata for cursor-based catalog lists. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Cursor for the final edge in this page. Use it as the next `after` value. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Indicates whether another page exists after the current page. */
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Lists all supported catalog categories in display order. */
  categories: Array<Category>;
  /** Lists donation projects using cursor-based pagination. */
  donationProjects: DonationProjectConnection;
  /** Lightweight health check for runtime diagnostics. */
  health: Scalars['String']['output'];
  /** Lists organizations using cursor-based pagination. */
  organizations: OrganizationConnection;
  /** Lists sale products using cursor-based pagination. */
  saleProducts: SaleProductConnection;
};


export type QueryDonationProjectsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySaleProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type SaleProduct = {
  __typename?: 'SaleProduct';
  categories: Array<Category>;
  cover: Asset;
  id: Scalars['ID']['output'];
  organization: Organization;
  priceAmount: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type SaleProductConnection = {
  __typename?: 'SaleProductConnection';
  edges: Array<SaleProductEdge>;
  pageInfo: PageInfo;
};

export type SaleProductEdge = {
  __typename?: 'SaleProductEdge';
  cursor: Scalars['String']['output'];
  node: SaleProduct;
};

export type CatalogAssetFieldsFragment = { __typename?: 'Asset', id: string, altText: string, url: string };

export type CatalogCategoryFieldsFragment = { __typename?: 'Category', id: string, name: string, sortOrder: number };

export type CatalogOrganizationListItemFragment = { __typename?: 'Organization', id: string, name: string, summary: string, logo: { __typename?: 'Asset', id: string, altText: string, url: string }, categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> };

export type CatalogDonationProjectListItemFragment = { __typename?: 'DonationProject', id: string, title: string, cover: { __typename?: 'Asset', id: string, altText: string, url: string }, organization: { __typename?: 'Organization', id: string, name: string }, categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> };

export type CatalogSaleProductListItemFragment = { __typename?: 'SaleProduct', id: string, title: string, priceAmount: string, cover: { __typename?: 'Asset', id: string, altText: string, url: string }, organization: { __typename?: 'Organization', id: string, name: string }, categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> };

export type CatalogCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CatalogCategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> };

export type CatalogOrganizationsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type CatalogOrganizationsQuery = { __typename?: 'Query', organizations: { __typename?: 'OrganizationConnection', edges: Array<{ __typename?: 'OrganizationEdge', cursor: string, node: { __typename?: 'Organization', id: string, name: string, summary: string, logo: { __typename?: 'Asset', id: string, altText: string, url: string }, categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type CatalogDonationProjectsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type CatalogDonationProjectsQuery = { __typename?: 'Query', donationProjects: { __typename?: 'DonationProjectConnection', edges: Array<{ __typename?: 'DonationProjectEdge', cursor: string, node: { __typename?: 'DonationProject', id: string, title: string, cover: { __typename?: 'Asset', id: string, altText: string, url: string }, organization: { __typename?: 'Organization', id: string, name: string }, categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type CatalogSaleProductsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type CatalogSaleProductsQuery = { __typename?: 'Query', saleProducts: { __typename?: 'SaleProductConnection', edges: Array<{ __typename?: 'SaleProductEdge', cursor: string, node: { __typename?: 'SaleProduct', id: string, title: string, priceAmount: string, cover: { __typename?: 'Asset', id: string, altText: string, url: string }, organization: { __typename?: 'Organization', id: string, name: string }, categories: Array<{ __typename?: 'Category', id: string, name: string, sortOrder: number }> } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export const CatalogAssetFieldsFragmentDoc = gql`
    fragment CatalogAssetFields on Asset {
  id
  altText
  url
}
    `;
export const CatalogCategoryFieldsFragmentDoc = gql`
    fragment CatalogCategoryFields on Category {
  id
  name
  sortOrder
}
    `;
export const CatalogOrganizationListItemFragmentDoc = gql`
    fragment CatalogOrganizationListItem on Organization {
  id
  name
  summary
  logo {
    ...CatalogAssetFields
  }
  categories {
    ...CatalogCategoryFields
  }
}
    ${CatalogAssetFieldsFragmentDoc}
${CatalogCategoryFieldsFragmentDoc}`;
export const CatalogDonationProjectListItemFragmentDoc = gql`
    fragment CatalogDonationProjectListItem on DonationProject {
  id
  title
  cover {
    ...CatalogAssetFields
  }
  organization {
    id
    name
  }
  categories {
    ...CatalogCategoryFields
  }
}
    ${CatalogAssetFieldsFragmentDoc}
${CatalogCategoryFieldsFragmentDoc}`;
export const CatalogSaleProductListItemFragmentDoc = gql`
    fragment CatalogSaleProductListItem on SaleProduct {
  id
  title
  priceAmount
  cover {
    ...CatalogAssetFields
  }
  organization {
    id
    name
  }
  categories {
    ...CatalogCategoryFields
  }
}
    ${CatalogAssetFieldsFragmentDoc}
${CatalogCategoryFieldsFragmentDoc}`;
export const CatalogCategoriesDocument = gql`
    query CatalogCategories {
  categories {
    ...CatalogCategoryFields
  }
}
    ${CatalogCategoryFieldsFragmentDoc}`;
export function useCatalogCategoriesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>(CatalogCategoriesDocument, options);
      }
export function useCatalogCategoriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>(CatalogCategoriesDocument, options);
        }
// @ts-ignore
export function useCatalogCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>;
export function useCatalogCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogCategoriesQuery | undefined, CatalogCategoriesQueryVariables>;
export function useCatalogCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>(CatalogCategoriesDocument, options);
        }
export type CatalogCategoriesQueryHookResult = ReturnType<typeof useCatalogCategoriesQuery>;
export type CatalogCategoriesLazyQueryHookResult = ReturnType<typeof useCatalogCategoriesLazyQuery>;
export type CatalogCategoriesSuspenseQueryHookResult = ReturnType<typeof useCatalogCategoriesSuspenseQuery>;
export type CatalogCategoriesQueryResult = ApolloReactCommon.QueryResult<CatalogCategoriesQuery, CatalogCategoriesQueryVariables>;
export const CatalogOrganizationsDocument = gql`
    query CatalogOrganizations($after: String, $categoryId: ID, $first: Int, $keyword: String) {
  organizations(
    after: $after
    categoryId: $categoryId
    first: $first
    keyword: $keyword
  ) {
    edges {
      cursor
      node {
        ...CatalogOrganizationListItem
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    ${CatalogOrganizationListItemFragmentDoc}`;
export function useCatalogOrganizationsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>(CatalogOrganizationsDocument, options);
      }
export function useCatalogOrganizationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>(CatalogOrganizationsDocument, options);
        }
// @ts-ignore
export function useCatalogOrganizationsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>;
export function useCatalogOrganizationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogOrganizationsQuery | undefined, CatalogOrganizationsQueryVariables>;
export function useCatalogOrganizationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>(CatalogOrganizationsDocument, options);
        }
export type CatalogOrganizationsQueryHookResult = ReturnType<typeof useCatalogOrganizationsQuery>;
export type CatalogOrganizationsLazyQueryHookResult = ReturnType<typeof useCatalogOrganizationsLazyQuery>;
export type CatalogOrganizationsSuspenseQueryHookResult = ReturnType<typeof useCatalogOrganizationsSuspenseQuery>;
export type CatalogOrganizationsQueryResult = ApolloReactCommon.QueryResult<CatalogOrganizationsQuery, CatalogOrganizationsQueryVariables>;
export const CatalogDonationProjectsDocument = gql`
    query CatalogDonationProjects($after: String, $categoryId: ID, $first: Int, $keyword: String) {
  donationProjects(
    after: $after
    categoryId: $categoryId
    first: $first
    keyword: $keyword
  ) {
    edges {
      cursor
      node {
        ...CatalogDonationProjectListItem
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    ${CatalogDonationProjectListItemFragmentDoc}`;
export function useCatalogDonationProjectsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>(CatalogDonationProjectsDocument, options);
      }
export function useCatalogDonationProjectsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>(CatalogDonationProjectsDocument, options);
        }
// @ts-ignore
export function useCatalogDonationProjectsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>;
export function useCatalogDonationProjectsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogDonationProjectsQuery | undefined, CatalogDonationProjectsQueryVariables>;
export function useCatalogDonationProjectsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>(CatalogDonationProjectsDocument, options);
        }
export type CatalogDonationProjectsQueryHookResult = ReturnType<typeof useCatalogDonationProjectsQuery>;
export type CatalogDonationProjectsLazyQueryHookResult = ReturnType<typeof useCatalogDonationProjectsLazyQuery>;
export type CatalogDonationProjectsSuspenseQueryHookResult = ReturnType<typeof useCatalogDonationProjectsSuspenseQuery>;
export type CatalogDonationProjectsQueryResult = ApolloReactCommon.QueryResult<CatalogDonationProjectsQuery, CatalogDonationProjectsQueryVariables>;
export const CatalogSaleProductsDocument = gql`
    query CatalogSaleProducts($after: String, $categoryId: ID, $first: Int, $keyword: String) {
  saleProducts(
    after: $after
    categoryId: $categoryId
    first: $first
    keyword: $keyword
  ) {
    edges {
      cursor
      node {
        ...CatalogSaleProductListItem
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    ${CatalogSaleProductListItemFragmentDoc}`;
export function useCatalogSaleProductsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>(CatalogSaleProductsDocument, options);
      }
export function useCatalogSaleProductsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>(CatalogSaleProductsDocument, options);
        }
// @ts-ignore
export function useCatalogSaleProductsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>;
export function useCatalogSaleProductsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CatalogSaleProductsQuery | undefined, CatalogSaleProductsQueryVariables>;
export function useCatalogSaleProductsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>(CatalogSaleProductsDocument, options);
        }
export type CatalogSaleProductsQueryHookResult = ReturnType<typeof useCatalogSaleProductsQuery>;
export type CatalogSaleProductsLazyQueryHookResult = ReturnType<typeof useCatalogSaleProductsLazyQuery>;
export type CatalogSaleProductsSuspenseQueryHookResult = ReturnType<typeof useCatalogSaleProductsSuspenseQuery>;
export type CatalogSaleProductsQueryResult = ApolloReactCommon.QueryResult<CatalogSaleProductsQuery, CatalogSaleProductsQueryVariables>;