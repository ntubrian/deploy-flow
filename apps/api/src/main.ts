import 'reflect-metadata';

import { createServer, Server } from 'node:http';

import { loadAppEnvironment } from './config/app-env';
import { createAppDataSource } from './database/typeorm.datasource';
import { createApp } from './server/create-app';

async function bootstrap(): Promise<Server> {
  const appEnvironment = await loadAppEnvironment();
  const dataSource = createAppDataSource(appEnvironment.database);

  await dataSource.initialize();

  const { app } = await createApp(appEnvironment, dataSource);
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(appEnvironment.port, resolve);
  });

  console.log(
    `API server listening at http://localhost:${appEnvironment.port}/${appEnvironment.apiPrefix}`
  );

  return server;
}

void bootstrap().catch((error: unknown) => {
  console.error('Failed to bootstrap API server', error);
  process.exitCode = 1;
});
