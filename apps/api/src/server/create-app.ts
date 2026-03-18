import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express, { type Express, type RequestHandler } from 'express';
import { DocumentNode } from 'graphql';
import * as swaggerUi from 'swagger-ui-express';
import { DataSource } from 'typeorm';

import { BoundedMemoryCache } from './bounded-memory-cache';
import { buildOpenApiDocument } from './openapi';
import { createWebGateMiddleware } from './web-gate';
import { type AppEnvironment } from '../config/app-env';
import { getGraphqlSchema } from '../graphql/schema';

import type { GraphqlContext } from './graphql-context';


export interface ApiApp {
  apolloServer: ApolloServer;
  app: Express;
}

export interface CreateAppOptions {
  createGraphqlContext?: (
    appEnvironment: AppEnvironment,
    dataSource: DataSource
  ) => GraphqlContext | Promise<GraphqlContext>;
}

function shouldEnableDeveloperInterfaces(appEnvironment: AppEnvironment): boolean {
  return appEnvironment.appStage === 'local' || appEnvironment.appStage === 'staging';
}

async function createDefaultGraphqlContext(
  appEnvironment: AppEnvironment,
  dataSource: DataSource
): Promise<GraphqlContext> {
  const graphqlContextModule =
    (await import('./graphql-context.js')) as typeof import('./graphql-context');

  return graphqlContextModule.createGraphqlContext(appEnvironment, dataSource);
}

export async function createApp(
  appEnvironment: AppEnvironment,
  dataSource: DataSource,
  options: CreateAppOptions = {}
): Promise<ApiApp> {
  const developerInterfacesEnabled =
    shouldEnableDeveloperInterfaces(appEnvironment);
  const openApiDocument = buildOpenApiDocument(appEnvironment);
  const graphqlCache = new BoundedMemoryCache<string>();
  const documentStore = new BoundedMemoryCache<DocumentNode>();
  const apolloPlugins = [ApolloServerPluginCacheControlDisabled()];

  if (developerInterfacesEnabled) {
    apolloPlugins.push(
      ApolloServerPluginLandingPageLocalDefault({
        embed: {
          endpointIsEditable: false,
          initialState: {
            pollForSchemaUpdates: true,
          },
          runTelemetry: false,
        },
        footer: false,
        includeCookies: true,
      })
    );
  }

  const app = express();
  const apolloServer = new ApolloServer({
    cache: graphqlCache,
    documentStore,
    introspection: developerInterfacesEnabled,
    plugins: apolloPlugins,
    schema: getGraphqlSchema(),
  });

  await apolloServer.start();

  app.disable('x-powered-by');
  app.use(
    cors({
      credentials: true,
      origin: appEnvironment.corsOrigins,
    })
  );
  app.use(express.json());
  app.use(`/${appEnvironment.apiPrefix}`, createWebGateMiddleware(appEnvironment));

  app.get(`/${appEnvironment.apiPrefix}/health`, (_request, response) => {
    response.json({
      database: dataSource.isInitialized ? 'up' : 'down',
      status: 'ok',
    });
  });

  if (developerInterfacesEnabled) {
    app.get(`/${appEnvironment.apiPrefix}/openapi.json`, (_request, response) => {
      response.json(openApiDocument);
    });
    app.use(
      `/${appEnvironment.apiPrefix}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        customCss: `
          .swagger-ui .topbar { display: none; }
          .swagger-ui .scheme-container { box-shadow: none; padding: 0 0 20px; }
          .swagger-ui .info { margin: 24px 0; }
        `,
        customSiteTitle: 'Deploy Flow API Docs',
        explorer: true,
        swaggerOptions: {
          displayRequestDuration: true,
          docExpansion: 'list',
          persistAuthorization: true,
        },
      })
    );
  }

  const graphqlHandler = expressMiddleware(apolloServer, {
    context: async () =>
      (options.createGraphqlContext ?? createDefaultGraphqlContext)(
        appEnvironment,
        dataSource
      ),
  }) as unknown as RequestHandler;

  app.use(
    `/${appEnvironment.apiPrefix}/${appEnvironment.graphqlPath}`,
    graphqlHandler
  );

  return {
    apolloServer,
    app,
  };
}
