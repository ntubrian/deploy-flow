type CatalogVariables = {
  after?: string | null
  categoryId?: string | null
  first?: number | null
  keyword?: string | null
}

type GraphqlRequestBody = {
  operationName?: string
  variables?: CatalogVariables
}

type CatalogScenario = 'default' | 'infinite-scroll'

function createAsset(id: string, altText: string, url: string) {
  return { __typename: 'Asset', altText, id, url }
}

function createCategory(id: string, name: string, sortOrder: number) {
  return { __typename: 'Category', id, name, sortOrder }
}

function createOrganization(
  id: string,
  name: string,
  summary: string,
  categoryIds: string[],
) {
  return {
    __typename: 'Organization',
    categories: categoryIds.map((categoryId) =>
      categoryId === 'cat-environment'
        ? createCategory('cat-environment', '環境保護', 2)
        : createCategory('cat-animal', '動物關懷', 1),
    ),
    id,
    logo: createAsset(`${id}-logo`, `${name} logo`, `https://example.com/${id}.png`),
    name,
    summary,
  }
}

function createDonationProject(
  id: string,
  title: string,
  organizationName: string,
  categoryNames: string[],
) {
  return {
    __typename: 'DonationProject',
    categories: categoryNames.map((name, index) =>
      createCategory(`${id}-category-${index}`, name, index + 1),
    ),
    cover: createAsset(`${id}-cover`, `${title} cover`, `https://example.com/${id}.png`),
    id,
    organization: {
      __typename: 'Organization',
      id: `${id}-organization`,
      name: organizationName,
    },
    title,
  }
}

function createSaleProduct(
  id: string,
  title: string,
  organizationName: string,
  priceAmount: number,
) {
  return {
    __typename: 'SaleProduct',
    categories: [],
    cover: createAsset(`${id}-cover`, `${title} cover`, `https://example.com/${id}.png`),
    id,
    organization: {
      __typename: 'Organization',
      id: `${id}-organization`,
      name: organizationName,
    },
    priceAmount: String(priceAmount),
    title,
  }
}

function createConnection<T>(
  connectionTypename:
    | 'DonationProjectConnection'
    | 'OrganizationConnection'
    | 'SaleProductConnection',
  edgeTypename:
    | 'DonationProjectEdge'
    | 'OrganizationEdge'
    | 'SaleProductEdge',
  nodes: T[],
  endCursor?: string | null,
  hasNextPage = false,
) {
  return {
    __typename: connectionTypename,
    edges: nodes.map((node, index) => ({
      __typename: edgeTypename,
      cursor: `${endCursor ?? 'cursor'}-${index}`,
      node,
    })),
    pageInfo: {
      __typename: 'PageInfo',
      endCursor: endCursor ?? null,
      hasNextPage,
    },
  }
}

function mockCatalogApi(scenario: CatalogScenario = 'default') {
  const categories = [
    createCategory('cat-animal', '動物關懷', 1),
    createCategory('cat-environment', '環境保護', 2),
  ]

  const defaultOrganizations = [
    createOrganization(
      'org-animal',
      '台灣浪浪協會',
      '協助流浪動物醫療與中途照護，建立更穩定的送養機制。',
      ['cat-animal'],
    ),
    createOrganization(
      'org-environment',
      '綠色地球行動',
      '推動淨灘、植樹與環境教育，號召更多人一起照顧地球。',
      ['cat-environment'],
    ),
  ]

  const donationProjects = [
    createDonationProject(
      'project-school-meal',
      '偏鄉學童營養午餐計畫',
      '孩童營養補給站',
      ['教育支持', '急難救助'],
    ),
    createDonationProject(
      'project-ocean',
      '海岸淨灘守護行動',
      '綠色地球行動',
      ['環境保護'],
    ),
  ]

  const saleProducts = [
    createSaleProduct(
      'product-coffee',
      '公平貿易濾掛咖啡禮盒',
      '小農支持平台',
      650,
    ),
    createSaleProduct(
      'product-bag',
      '再生材質日常提袋',
      '綠色地球行動',
      390,
    ),
  ]

  const infinitePageOne = Array.from({ length: 20 }, (_, index) =>
    createOrganization(
      `org-page-1-${index + 1}`,
      `公益團體 ${index + 1}`,
      `第 ${index + 1} 個公益團體簡介`,
      [index % 2 === 0 ? 'cat-animal' : 'cat-environment'],
    ),
  )
  const infinitePageTwo = [
    createOrganization(
      'org-page-2-food',
      '社區糧食計畫',
      '串連在地食物銀行與弱勢家庭，提供穩定糧食補給。',
      ['cat-environment'],
    ),
  ]

  let searchErrorCount = 0

  cy.intercept('POST', '**/api/graphql', (req) => {
    const body = req.body as GraphqlRequestBody

    switch (body.operationName) {
      case 'CatalogCategories': {
        req.alias = 'gqlCatalogCategories'
        req.reply({
          body: {
            data: {
              __typename: 'Query',
              categories,
            },
          },
        })
        return
      }

      case 'CatalogOrganizations': {
        req.alias = 'gqlCatalogOrganizations'
        const variables = body.variables ?? {}

        if (variables.keyword === '錯誤測試') {
          searchErrorCount += 1

          if (searchErrorCount === 1) {
            req.reply({
              body: {
                errors: [{ message: 'catalog query failed' }],
              },
              statusCode: 500,
            })
            return
          }

          req.reply({
            body: {
              data: {
                __typename: 'Query',
                organizations: createConnection(
                  'OrganizationConnection',
                  'OrganizationEdge',
                  [defaultOrganizations[0]],
                  null,
                  false,
                ),
              },
            },
          })
          return
        }

        if (variables.keyword === '沒有結果') {
          req.reply({
            body: {
              data: {
                __typename: 'Query',
                organizations: createConnection(
                  'OrganizationConnection',
                  'OrganizationEdge',
                  [],
                  null,
                  false,
                ),
              },
            },
          })
          return
        }

        if (scenario === 'infinite-scroll') {
          if (variables.after === 'org-page-1') {
            req.reply({
              body: {
                data: {
                  __typename: 'Query',
                  organizations: createConnection(
                    'OrganizationConnection',
                    'OrganizationEdge',
                    infinitePageTwo,
                    'org-page-2',
                    false,
                  ),
                },
              },
            })
            return
          }

          req.reply({
            body: {
              data: {
                __typename: 'Query',
                organizations: createConnection(
                  'OrganizationConnection',
                  'OrganizationEdge',
                  infinitePageOne,
                  'org-page-1',
                  true,
                ),
              },
            },
          })
          return
        }

        if (variables.categoryId === 'cat-environment') {
          req.reply({
            body: {
              data: {
                __typename: 'Query',
                organizations: createConnection(
                  'OrganizationConnection',
                  'OrganizationEdge',
                  [defaultOrganizations[1]],
                  null,
                  false,
                ),
              },
            },
          })
          return
        }

        if (variables.keyword === '環保') {
          req.reply({
            body: {
              data: {
                __typename: 'Query',
                organizations: createConnection(
                  'OrganizationConnection',
                  'OrganizationEdge',
                  [defaultOrganizations[1]],
                  null,
                  false,
                ),
              },
            },
            delay: 300,
          })
          return
        }

        req.reply({
          body: {
            data: {
              __typename: 'Query',
              organizations: createConnection(
                'OrganizationConnection',
                'OrganizationEdge',
                defaultOrganizations,
                null,
                false,
              ),
            },
          },
        })
        return
      }

      case 'CatalogDonationProjects': {
        req.alias = 'gqlCatalogDonationProjects'
        req.reply({
          body: {
            data: {
              __typename: 'Query',
              donationProjects: createConnection(
                'DonationProjectConnection',
                'DonationProjectEdge',
                donationProjects,
                null,
                false,
              ),
            },
          },
        })
        return
      }

      case 'CatalogSaleProducts': {
        req.alias = 'gqlCatalogSaleProducts'
        req.reply({
          body: {
            data: {
              __typename: 'Query',
              saleProducts: createConnection(
                'SaleProductConnection',
                'SaleProductEdge',
                saleProducts,
                null,
                false,
              ),
            },
          },
        })
        return
      }

      default: {
        req.reply({
          body: {
            data: {},
          },
        })
      }
    }
  })
}

function visitCatalogPage(scenario: CatalogScenario = 'default') {
  mockCatalogApi(scenario)
  cy.visit('/')
  cy.wait('@gqlCatalogCategories')
  cy.wait('@gqlCatalogOrganizations')
}

describe('catalog page', () => {
  it('切換 tab 會顯示對應列表內容', () => {
    visitCatalogPage()

    cy.contains('所有捐款項目').should('be.visible')
    cy.getByTestId('catalog-tab-organizations').should(
      'have.attr',
      'aria-pressed',
      'true',
    )
    cy.get('[data-testid^="organization-card-"]').should('have.length', 2)

    cy.getByTestId('catalog-tab-donationProjects').click()
    cy.wait('@gqlCatalogDonationProjects')
    cy.getByTestId('catalog-tab-donationProjects').should(
      'have.attr',
      'aria-pressed',
      'true',
    )
    cy.get('[data-testid^="donation-project-card-"]').should('have.length', 2)
    cy.contains('偏鄉學童營養午餐計畫').should('be.visible')

    cy.getByTestId('catalog-tab-saleProducts').click()
    cy.wait('@gqlCatalogSaleProducts')
    cy.getByTestId('catalog-tab-saleProducts').should(
      'have.attr',
      'aria-pressed',
      'true',
    )
    cy.get('[data-testid^="sale-product-card-"]').should('have.length', 2)
    cy.contains('公平貿易濾掛咖啡禮盒').should('be.visible')
  })

  it('搜尋會帶入正確 query 參數並顯示 loading 狀態', () => {
    visitCatalogPage()

    cy.getByTestId('catalog-open-search').click()
    cy.getByTestId('catalog-search-input').type('環保')
    cy.getByTestId('catalog-search-loading').should('be.visible')

    cy.wait('@gqlCatalogOrganizations')
      .its('request.body.variables.keyword')
      .should('eq', '環保')

    cy.get('[data-testid^="organization-card-"]').should('have.length', 1)
    cy.contains('綠色地球行動').should('be.visible')
    cy.getByTestId('catalog-search-cancel').click()
    cy.getByTestId('catalog-open-search').should('be.visible')
  })

  it('類別 modal 可以開關、保留 active state，並在切換類別後重置列表', () => {
    visitCatalogPage()

    cy.getByTestId('catalog-open-category').click()
    cy.getByTestId('catalog-category-modal').should('be.visible')
    cy.getByTestId('catalog-category-close').click()
    cy.getByTestId('catalog-category-modal').should('not.exist')

    cy.getByTestId('catalog-open-category').click()
    cy.getByTestId('catalog-category-option-cat-environment')
      .should('have.attr', 'aria-pressed', 'false')
      .click()

    cy.wait('@gqlCatalogOrganizations')
      .its('request.body.variables.categoryId')
      .should('eq', 'cat-environment')

    cy.getByTestId('catalog-category-modal').should('not.exist')
    cy.getByTestId('catalog-open-category').contains('環境保護')
    cy.get('[data-testid^="organization-card-"]').should('have.length', 1)
    cy.get('body').should('contain', '綠色地球行動')
    cy.get('body').should('not.contain', '台灣浪浪協會')

    cy.getByTestId('catalog-open-category').click()
    cy.getByTestId('catalog-category-option-cat-environment').should(
      'have.attr',
      'aria-pressed',
      'true',
    )
  })

  it('往下捲動會追加載入下一頁資料', () => {
    visitCatalogPage('infinite-scroll')

    cy.getByTestId('catalog-list-scroll').scrollTo('bottom', {
      duration: 200,
      ensureScrollable: false,
    })

    cy.wait('@gqlCatalogOrganizations')
      .its('request.body.variables.after')
      .should('eq', 'org-page-1')

    cy.contains('社區糧食計畫').should('be.visible')
  })

  it('查無資料時會顯示空狀態', () => {
    visitCatalogPage()

    cy.getByTestId('catalog-open-search').click()
    cy.getByTestId('catalog-search-input').type('沒有結果')
    cy.wait('@gqlCatalogOrganizations')

    cy.getByTestId('catalog-empty-state').should('be.visible')
    cy.contains('查無相關資料').should('be.visible')
  })

  it('API 錯誤時會顯示錯誤狀態，重試後可恢復', () => {
    visitCatalogPage()

    cy.getByTestId('catalog-open-search').click()
    cy.getByTestId('catalog-search-input').type('錯誤測試')
    cy.wait('@gqlCatalogOrganizations')
    cy.getByTestId('catalog-error-state').should('be.visible')

    cy.getByTestId('catalog-error-retry').click()
    cy.wait('@gqlCatalogOrganizations')
      .its('request.body.variables.keyword')
      .should('eq', '錯誤測試')

    cy.contains('台灣浪浪協會').should('be.visible')
    cy.getByTestId('catalog-error-state').should('not.exist')
  })
})
