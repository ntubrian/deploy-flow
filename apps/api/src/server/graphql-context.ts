import { DataSource } from 'typeorm';

import { createCatalogLoaders, type CatalogLoaders } from '../catalog/loaders';
import {
  createCatalogRepositories,
  type CatalogRepositories,
} from '../catalog/repositories';
import { type AppEnvironment } from '../config/app-env';

export interface GraphqlRequestContext {
  webGate: {
    isAuthenticated: boolean;
  };
}

export interface GraphqlContext {
  appEnvironment: AppEnvironment;
  dataSource: DataSource;
  loaders: CatalogLoaders;
  repositories: CatalogRepositories;
  webGate: GraphqlRequestContext['webGate'];
}

export function createGraphqlContext(
  appEnvironment: AppEnvironment,
  dataSource: DataSource,
  requestContext: GraphqlRequestContext
): GraphqlContext {
  const repositories = createCatalogRepositories(dataSource);

  return {
    appEnvironment,
    dataSource,
    loaders: createCatalogLoaders(repositories),
    repositories,
    webGate: requestContext.webGate,
  };
}
