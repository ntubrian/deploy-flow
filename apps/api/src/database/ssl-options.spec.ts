import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveSslOptions } from './ssl-options';

describe('ssl-options', () => {
  it('disables ssl when database ssl is false', () => {
    expect(
      resolveSslOptions({
        host: '127.0.0.1',
        logging: false,
        name: 'deploy_flow',
        password: 'postgres',
        port: 5432,
        ssl: false,
        synchronize: false,
        username: 'postgres',
      })
    ).toBe(false);
  });

  it('enables strict ssl verification by default when database ssl is true', () => {
    expect(
      resolveSslOptions({
        host: 'staging-postgres.internal',
        logging: false,
        name: 'deploy_flow',
        password: 'postgres',
        port: 5432,
        ssl: true,
        synchronize: false,
        username: 'postgres',
      })
    ).toEqual({
      rejectUnauthorized: true,
    });
  });

  it('loads the configured root certificate file when a path is provided', () => {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'deploy-flow-db-cert-'));
    const rootCertPath = join(tempDirectory, 'rds-root.pem');

    try {
      writeFileSync(
        rootCertPath,
        '-----BEGIN CERTIFICATE-----\nlocal-test\n-----END CERTIFICATE-----\n',
        'utf8'
      );

      expect(
        resolveSslOptions({
          host: 'staging-postgres.internal',
          logging: false,
          name: 'deploy_flow',
          password: 'postgres',
          port: 5432,
          ssl: true,
          sslRootCertPath: rootCertPath,
          synchronize: false,
          username: 'postgres',
        })
      ).toEqual({
        ca: '-----BEGIN CERTIFICATE-----\nlocal-test\n-----END CERTIFICATE-----\n',
        rejectUnauthorized: true,
      });
    } finally {
      rmSync(tempDirectory, { force: true, recursive: true });
    }
  });
});
