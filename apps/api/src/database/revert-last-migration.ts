import 'reflect-metadata';

import { createAppDataSource } from './typeorm.datasource';
import { loadDatabaseConfig } from '../config/app-env';

async function revertLastMigration(): Promise<void> {
  const databaseConfig = await loadDatabaseConfig();
  const dataSource = createAppDataSource(databaseConfig);

  try {
    await dataSource.initialize();
    await dataSource.undoLastMigration();
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void revertLastMigration().catch((error: unknown) => {
  console.error('Failed to revert database migration', error);
  process.exitCode = 1;
});
