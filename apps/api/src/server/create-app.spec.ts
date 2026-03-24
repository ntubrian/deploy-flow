import request from 'supertest';
import { DataSource } from 'typeorm';

import { createApp } from './create-app';
import { GraphqlContext } from './graphql-context';
import { AppEnvironment } from '../config/app-env';

describe('createApp', () => {
  const baseAppEnvironment: AppEnvironment = {
    apiPrefix: 'api',
    appStage: 'local',
    aws: {
      parameterPrefix: '/deploy-flow',
      region: 'ap-northeast-1',
    },
    corsOrigins: ['http://localhost:4200'],
    database: {
      host: '127.0.0.1',
      logging: false,
      name: 'deploy_flow',
      password: 'postgres',
      port: 5433,
      ssl: false,
      synchronize: false,
      username: 'postgres',
    },
    graphqlPath: 'graphql',
    port: 3000,
    webGate: {
      basicUsername: 'deploy-flow',
      sessionSecret: 'session-secret',
      sessionTtlSeconds: 86400,
      sharedSecret: 'shared-secret',
    },
  };

  let apolloServer: Awaited<ReturnType<typeof createApp>>['apolloServer'];
  let app: Awaited<ReturnType<typeof createApp>>['app'];

  async function setup(appEnvironment: AppEnvironment) {
    const graphqlContext = {
      appEnvironment,
      dataSource: {
        isInitialized: true,
      } as DataSource,
      loaders: {
        assetById: {
          load: jest.fn(),
        },
        categoriesByDonationProjectId: {
          load: jest.fn(),
        },
        categoriesByOrganizationId: {
          load: jest.fn(),
        },
        categoriesBySaleProductId: {
          load: jest.fn(),
        },
        organizationById: {
          load: jest.fn(),
        },
      },
      repositories: {
        categoryRepository: {
          findAll: jest.fn().mockResolvedValue([]),
        },
        donationProjectRepository: {
          findConnection: jest.fn().mockResolvedValue({
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          }),
        },
        organizationRepository: {
          findConnection: jest.fn().mockResolvedValue({
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          }),
        },
        saleProductRepository: {
          findConnection: jest.fn().mockResolvedValue({
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          }),
        },
      },
    } as unknown as GraphqlContext;

    const apiApp = await createApp(appEnvironment, {
      isInitialized: true,
    } as DataSource, {
      createGraphqlContext: async (_appEnvironment, _dataSource, requestContext) => ({
        ...graphqlContext,
        webGate: requestContext.webGate,
      }),
    });

    app = apiApp.app;
    apolloServer = apiApp.apolloServer;
  }

  afterEach(async () => {
    await apolloServer.stop();
  });

  function buildBasicAuthorizationHeader(
    username = baseAppEnvironment.webGate.basicUsername,
    password = baseAppEnvironment.webGate.sharedSecret
  ): string {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  it('returns a healthy status payload', async () => {
    await setup(baseAppEnvironment);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      database: 'up',
      status: 'ok',
    });
  });

  it('serves the GraphQL health query', async () => {
    await setup(baseAppEnvironment);

    const response = await request(app).post('/api/graphql').send({
      query: '{ health }',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        health: 'ok',
      },
    });
  });

  it('rejects unauthenticated local GraphQL queries that are not public', async () => {
    await setup(baseAppEnvironment);

    const response = await request(app).post('/api/graphql').send({
      query: '{ organizations { edges { cursor } } }',
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeNull();
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'UNAUTHENTICATED',
          }),
          message: 'Unauthorized',
        }),
      ])
    );
  });

  it('serves Apollo Sandbox and Swagger UI in local stage', async () => {
    await setup(baseAppEnvironment);

    const graphqlResponse = await request(app)
      .get('/api/graphql')
      .set('Accept', 'text/html');
    const openApiResponse = await request(app).get('/api/openapi.json');
    const swaggerResponse = await request(app).get('/api/docs/');

    expect(graphqlResponse.status).toBe(200);
    expect(graphqlResponse.type).toContain('html');
    expect(graphqlResponse.text).toContain('Apollo Sandbox');
    expect(openApiResponse.status).toBe(200);
    expect(openApiResponse.body.openapi).toBe('3.1.0');
    expect(swaggerResponse.status).toBe(200);
    expect(swaggerResponse.type).toContain('html');
    expect(swaggerResponse.text).toContain('Deploy Flow API Docs');
  });

  it('hides developer-only surfaces in production stage', async () => {
    await setup({
      ...baseAppEnvironment,
      appStage: 'production',
    });

    const authHeader = buildBasicAuthorizationHeader();
    const openApiResponse = await request(app)
      .get('/api/openapi.json')
      .set('Authorization', authHeader);
    const swaggerResponse = await request(app)
      .get('/api/docs/')
      .set('Authorization', authHeader);

    expect(openApiResponse.status).toBe(404);
    expect(swaggerResponse.status).toBe(404);
  });

  it('rejects unauthenticated staging GraphQL queries', async () => {
    await setup({
      ...baseAppEnvironment,
      appStage: 'staging',
    });

    const organizationsResponse = await request(app).post('/api/graphql').send({
      query: '{ organizations { edges { cursor } } }',
    });
    const healthResponse = await request(app).post('/api/graphql').send({
      query: '{ health }',
    });

    expect(organizationsResponse.status).toBe(401);
    expect(organizationsResponse.headers['www-authenticate']).toContain('Basic');
    expect(organizationsResponse.body).toEqual({
      error: 'Unauthorized',
    });
    expect(healthResponse.status).toBe(401);
    expect(healthResponse.headers['www-authenticate']).toContain('Basic');
    expect(healthResponse.body).toEqual({
      error: 'Unauthorized',
    });
  });

  it('allows unauthenticated staging health checks over HTTP', async () => {
    await setup({
      ...baseAppEnvironment,
      appStage: 'staging',
    });

    const healthResponse = await request(app).get('/api/health');

    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body).toEqual({
      database: 'up',
      status: 'ok',
    });
  });

  it('allows authenticated staging GraphQL queries and docs', async () => {
    await setup({
      ...baseAppEnvironment,
      appStage: 'staging',
    });

    const authHeader = buildBasicAuthorizationHeader();
    const graphqlResponse = await request(app)
      .post('/api/graphql')
      .set('Authorization', authHeader)
      .send({
        query: '{ organizations { edges { cursor } pageInfo { hasNextPage endCursor } } }',
      });
    const docsResponse = await request(app)
      .get('/api/docs/')
      .set('Authorization', authHeader);

    expect(graphqlResponse.status).toBe(200);
    expect(graphqlResponse.body).toEqual({
      data: {
        organizations: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
    expect(docsResponse.status).toBe(200);
  });
});
