import { DataSource } from 'typeorm';

import { createCatalogLoaders, type CatalogLoaders } from '../catalog/loaders';
import {
  createCatalogRepositories,
  type CatalogRepositories,
} from '../catalog/repositories';
import { type AppEnvironment } from '../config/app-env';

export interface GraphqlContext {
  appEnvironment: AppEnvironment;
  dataSource: DataSource;
  loaders: CatalogLoaders;
  repositories: CatalogRepositories;
}

export function createGraphqlContext(
  appEnvironment: AppEnvironment,
  dataSource: DataSource
): GraphqlContext {
  const repositories = createCatalogRepositories(dataSource);

  return {
    appEnvironment,
    dataSource,
    loaders: createCatalogLoaders(repositories),
    repositories,
  };
}
