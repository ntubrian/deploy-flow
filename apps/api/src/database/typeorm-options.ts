import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';

import { catalogEntities } from './entities';
import { DatabaseConfig } from '../config/app-env';

function resolveSslOptions(databaseConfig: DatabaseConfig) {
  if (!databaseConfig.ssl) {
    return false;
  }

  return {
    rejectUnauthorized: false,
  };
}

export function buildTypeOrmOptions(
  databaseConfig: DatabaseConfig
): DataSourceOptions {
  return {
    database: databaseConfig.name,
    entities: [...catalogEntities],
    host: databaseConfig.host,
    logging: databaseConfig.logging,
    migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'typeorm_migrations',
    password: databaseConfig.password,
    port: databaseConfig.port,
    ssl: resolveSslOptions(databaseConfig),
    synchronize: databaseConfig.synchronize,
    type: 'postgres',
    username: databaseConfig.username,
    uuidExtension: 'pgcrypto',
  };
}
