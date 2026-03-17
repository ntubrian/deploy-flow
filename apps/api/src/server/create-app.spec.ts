import request from 'supertest';
import { DataSource } from 'typeorm';

import { createApp } from './create-app';
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
      sessionSecret: 'session-secret',
      sessionTtlSeconds: 86400,
      sharedSecret: 'shared-secret',
    },
  };

  let apolloServer: Awaited<ReturnType<typeof createApp>>['apolloServer'];
  let app: Awaited<ReturnType<typeof createApp>>['app'];

  async function setup(appEnvironment: AppEnvironment) {
    const apiApp = await createApp(appEnvironment, {
      isInitialized: true,
    } as DataSource);

    app = apiApp.app;
    apolloServer = apiApp.apolloServer;
  }

  afterEach(async () => {
    await apolloServer.stop();
  });

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

    const openApiResponse = await request(app).get('/api/openapi.json');
    const swaggerResponse = await request(app).get('/api/docs/');

    expect(openApiResponse.status).toBe(404);
    expect(swaggerResponse.status).toBe(404);
  });
});
