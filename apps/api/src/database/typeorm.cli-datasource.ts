import 'reflect-metadata';

import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';

import { buildTypeOrmOptions } from './typeorm-options';

const TRUTHY_ENV_VALUES = new Set(['1', 'true', 'yes', 'on']);

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return TRUTHY_ENV_VALUES.has(value.trim().toLowerCase());
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid integer value: ${value}`);
  }

  return parsedValue;
}

loadDotenv({ path: resolve(process.cwd(), '../../.env') });
loadDotenv({ path: resolve(process.cwd(), '../../.env.local') });
loadDotenv({ path: resolve(process.cwd(), '.env') });
loadDotenv({ path: resolve(process.cwd(), '.env.local') });

const dataSource = new DataSource(
  buildTypeOrmOptions({
    host: process.env.DB_HOST ?? '127.0.0.1',
    logging: parseBoolean(process.env.DB_LOGGING, false),
    name: process.env.DB_NAME ?? 'deploy_flow',
    password: process.env.DB_PASSWORD ?? 'postgres',
    port: parseInteger(process.env.DB_PORT, 5433),
    ssl: parseBoolean(process.env.DB_SSL, false),
    sslRootCertPath: process.env.DB_SSL_ROOT_CERT_PATH || undefined,
    synchronize: false,
    username: process.env.DB_USERNAME ?? 'postgres',
  })
);

export default dataSource;
