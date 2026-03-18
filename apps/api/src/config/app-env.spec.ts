import type * as AppEnvModule from './app-env';

const sendMock = jest.fn();
const ssmClientMock = jest.fn();

jest.mock('@aws-sdk/client-ssm', () => ({
  GetParametersCommand: function GetParametersCommand(input: unknown) {
    return { input };
  },
  SSMClient: function SSMClient(config: unknown) {
    ssmClientMock(config);

    return {
      send: sendMock,
    };
  },
}));

let loadAppEnvironment: typeof AppEnvModule.loadAppEnvironment;
let loadDatabaseConfig: typeof AppEnvModule.loadDatabaseConfig;

describe('app-env', () => {
  beforeAll(async () => {
    const appEnvModule: typeof AppEnvModule = await import('./app-env');

    loadAppEnvironment = appEnvModule.loadAppEnvironment;
    loadDatabaseConfig = appEnvModule.loadDatabaseConfig;
  });

  beforeEach(() => {
    sendMock.mockReset();
    ssmClientMock.mockReset();
  });

  it('uses local Docker Postgres defaults for the local stage', async () => {
    const database = await loadDatabaseConfig({
      APP_STAGE: 'local',
      DB_LOGGING: 'true',
    });

    expect(database).toEqual({
      host: '127.0.0.1',
      logging: true,
      name: 'deploy_flow',
      password: 'postgres',
      port: 5433,
      ssl: false,
      sslRootCertPath: undefined,
      synchronize: false,
      username: 'postgres',
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('uses local environment web gate secrets for the local stage', async () => {
    const appEnvironment = await loadAppEnvironment({
      APP_STAGE: 'local',
      WEB_GATE_SESSION_SECRET: 'local-session-secret',
      WEB_GATE_SHARED_SECRET: 'local-shared-secret',
    });

    expect(sendMock).not.toHaveBeenCalled();
    expect(ssmClientMock).not.toHaveBeenCalled();
    expect(appEnvironment.webGate).toEqual({
      basicUsername: 'deploy-flow',
      sessionSecret: 'local-session-secret',
      sessionTtlSeconds: 86400,
      sharedSecret: 'local-shared-secret',
    });
  });

  it('loads non-local database connection settings from SSM', async () => {
    sendMock.mockResolvedValue({
      InvalidParameters: [],
      Parameters: [
        {
          Name: '/custom/staging/api/database/host',
          Value: 'staging.db.internal',
        },
        {
          Name: '/custom/staging/api/database/name',
          Value: 'deploy_flow_staging',
        },
        {
          Name: '/custom/staging/api/database/password',
          Value: 'password-from-ssm',
        },
        {
          Name: '/custom/staging/api/database/port',
          Value: '5432',
        },
        {
          Name: '/custom/staging/api/database/ssl',
          Value: 'true',
        },
        {
          Name: '/custom/staging/api/database/username',
          Value: 'deploy_flow_user',
        },
      ],
    });

    const database = await loadDatabaseConfig({
      APP_STAGE: 'staging',
      AWS_REGION: 'ap-northeast-1',
      AWS_SSM_PARAMETER_PREFIX: '/custom',
      DB_LOGGING: 'false',
    });

    expect(database).toEqual({
      host: 'staging.db.internal',
      logging: false,
      name: 'deploy_flow_staging',
      password: 'password-from-ssm',
      port: 5432,
      ssl: true,
      sslRootCertPath: undefined,
      synchronize: false,
      username: 'deploy_flow_user',
    });
  });

  it('loads non-local web gate secrets from SSM', async () => {
    sendMock.mockResolvedValue({
      InvalidParameters: [],
      Parameters: [
        {
          Name: '/deploy-flow/staging/api/web-gate/session-secret',
          Value: 'staging-session-secret',
        },
        {
          Name: '/deploy-flow/staging/api/web-gate/shared-secret',
          Value: 'staging-shared-secret',
        },
        {
          Name: '/deploy-flow/staging/api/database/host',
          Value: 'staging.db.internal',
        },
        {
          Name: '/deploy-flow/staging/api/database/name',
          Value: 'deploy_flow_staging',
        },
        {
          Name: '/deploy-flow/staging/api/database/password',
          Value: 'password-from-ssm',
        },
        {
          Name: '/deploy-flow/staging/api/database/port',
          Value: '5432',
        },
        {
          Name: '/deploy-flow/staging/api/database/ssl',
          Value: 'true',
        },
        {
          Name: '/deploy-flow/staging/api/database/username',
          Value: 'deploy_flow_user',
        },
      ],
    });

    const appEnvironment = await loadAppEnvironment({
      APP_STAGE: 'staging',
      AWS_REGION: 'ap-northeast-1',
    });

    expect(ssmClientMock).toHaveBeenCalledWith({ region: 'ap-northeast-1' });
    expect(appEnvironment.webGate).toEqual({
      basicUsername: 'deploy-flow',
      sessionSecret: 'staging-session-secret',
      sessionTtlSeconds: 86400,
      sharedSecret: 'staging-shared-secret',
    });
  });
});
