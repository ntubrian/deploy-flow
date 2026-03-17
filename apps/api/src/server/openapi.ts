import { type AppEnvironment } from '../config/app-env';

export function buildOpenApiDocument(appEnvironment: AppEnvironment) {
  const basePath = `/${appEnvironment.apiPrefix}`;

  return {
    openapi: '3.1.0',
    info: {
      title: 'Deploy Flow API',
      version: '0.1.0',
      description:
        'REST surface for operational endpoints. GraphQL queries are available from the Apollo Sandbox at /api/graphql.',
    },
    servers: [
      {
        url: basePath,
      },
    ],
    tags: [
      {
        name: 'System',
        description: 'Service health and runtime diagnostics.',
      },
    ],
    paths: {
      '/health': {
        get: {
          operationId: 'getHealthStatus',
          summary: 'Health check',
          tags: ['System'],
          responses: {
            '200': {
              description: 'API and database connectivity status.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'ok',
                      },
                      database: {
                        type: 'string',
                        example: 'up',
                      },
                    },
                    required: ['status', 'database'],
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
