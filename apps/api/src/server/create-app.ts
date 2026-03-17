import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express, { type Express } from 'express';
import { DocumentNode } from 'graphql';
import * as swaggerUi from 'swagger-ui-express';
import { DataSource } from 'typeorm';

import { BoundedMemoryCache } from './bounded-memory-cache';
import { resolvers, typeDefs } from './graphql';
import { buildOpenApiDocument } from './openapi';
import { type AppEnvironment } from '../config/app-env';

export interface ApiApp {
  apolloServer: ApolloServer;
  app: Express;
}

function shouldEnableDeveloperInterfaces(appEnvironment: AppEnvironment): boolean {
  return appEnvironment.appStage === 'local' || appEnvironment.appStage === 'staging';
}

export async function createApp(
  appEnvironment: AppEnvironment,
  dataSource: DataSource
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
    resolvers,
    typeDefs,
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

  app.use(
    `/${appEnvironment.apiPrefix}/${appEnvironment.graphqlPath}`,
    expressMiddleware(apolloServer, {
      context: async () => ({
        appEnvironment,
        dataSource,
      }),
    })
  );

  return {
    apolloServer,
    app,
  };
}
