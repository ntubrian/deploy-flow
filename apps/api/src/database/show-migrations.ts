import 'reflect-metadata';

import { createAppDataSource } from './typeorm.datasource';
import { loadDatabaseConfig } from '../config/app-env';

interface MigrationRow {
  name: string;
}

async function loadExecutedMigrationNames(
  dataSource: ReturnType<typeof createAppDataSource>
): Promise<string[]> {
  try {
    const rows = (await dataSource.query(
      'SELECT name FROM typeorm_migrations ORDER BY id ASC'
    )) as MigrationRow[];

    return rows.map((row) => row.name);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '42P01'
    ) {
      return [];
    }

    throw error;
  }
}

async function showMigrations(): Promise<void> {
  const databaseConfig = await loadDatabaseConfig();
  const dataSource = createAppDataSource(databaseConfig);

  try {
    await dataSource.initialize();

    const executedNames = await loadExecutedMigrationNames(dataSource);
    const executedNameSet = new Set(executedNames);
    const allMigrations = dataSource.migrations
      .map((migration) => migration.name)
      .filter((migrationName): migrationName is string => typeof migrationName === 'string');
    const pendingMigrations = allMigrations.filter(
      (migrationName) => !executedNameSet.has(migrationName)
    );

    console.log('Applied migrations:');

    if (executedNames.length === 0) {
      console.log('- none');
    } else {
      for (const migrationName of executedNames) {
        console.log(`- ${migrationName}`);
      }
    }

    console.log('Pending migrations:');

    if (pendingMigrations.length === 0) {
      console.log('- none');
    } else {
      for (const migrationName of pendingMigrations) {
        console.log(`- ${migrationName}`);
      }
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void showMigrations().catch((error: unknown) => {
  console.error('Failed to show database migrations', error);
  process.exitCode = 1;
});
