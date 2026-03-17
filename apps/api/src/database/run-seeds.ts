import 'reflect-metadata';

import { loadDatabaseConfig } from '../config/app-env';
import { seedCatalog } from './seeds/catalog.seed';
import { createAppDataSource } from './typeorm.datasource';

async function runSeeds(): Promise<void> {
  const databaseConfig = await loadDatabaseConfig();
  const dataSource = createAppDataSource(databaseConfig);

  try {
    await dataSource.initialize();
    await seedCatalog(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void runSeeds().catch((error: unknown) => {
  console.error('Failed to run database seeds', error);
  process.exitCode = 1;
});
