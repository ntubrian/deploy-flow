import { existsSync, readFileSync } from 'node:fs';

import { type DatabaseConfig } from '../config/app-env';

export function resolveSslOptions(databaseConfig: DatabaseConfig) {
  if (!databaseConfig.ssl) {
    return false;
  }

  const sslOptions: {
    ca?: string;
    rejectUnauthorized: true;
  } = {
    rejectUnauthorized: true,
  };

  if (databaseConfig.sslRootCertPath) {
    if (!existsSync(databaseConfig.sslRootCertPath)) {
      throw new Error(
        `DB_SSL_ROOT_CERT_PATH does not exist: ${databaseConfig.sslRootCertPath}`
      );
    }

    sslOptions.ca = readFileSync(databaseConfig.sslRootCertPath, 'utf8');
  }

  return sslOptions;
}
