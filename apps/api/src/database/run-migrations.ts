import 'reflect-metadata';

import { createAppDataSource } from './typeorm.datasource';
import { loadDatabaseConfig } from '../config/app-env';

async function runMigrations(): Promise<void> {
  const databaseConfig = await loadDatabaseConfig();
  const dataSource = createAppDataSource(databaseConfig);

  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void runMigrations().catch((error: unknown) => {
  console.error('Failed to run database migrations', error);
  process.exitCode = 1;
});
