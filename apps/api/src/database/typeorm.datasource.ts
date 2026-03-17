import { DataSource } from 'typeorm';

import { buildTypeOrmOptions } from './typeorm-options';
import { DatabaseConfig } from '../config/app-env';

export function createAppDataSource(databaseConfig: DatabaseConfig): DataSource {
  return new DataSource(buildTypeOrmOptions(databaseConfig));
}
