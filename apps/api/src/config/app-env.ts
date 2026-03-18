import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_FILE_CANDIDATES = [
  resolve(process.cwd(), '../../.env'),
  resolve(process.cwd(), '../../.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '.env.local'),
];

const SSM_PATH_SUFFIXES = {
  databaseHost: 'database/host',
  databaseName: 'database/name',
  databasePassword: 'database/password',
  databasePort: 'database/port',
  databaseSsl: 'database/ssl',
  databaseUsername: 'database/username',
  webGateSessionSecret: 'web-gate/session-secret',
  webGateSharedSecret: 'web-gate/shared-secret',
} as const;

export type AppStage = 'local' | 'production' | 'staging';

export interface DatabaseConfig {
  host: string;
  logging: boolean;
  name: string;
  password: string;
  port: number;
  ssl: boolean;
  sslRootCertPath?: string;
  synchronize: false;
  username: string;
}

export interface AppEnvironment {
  apiPrefix: string;
  appStage: AppStage;
  aws: {
    parameterPrefix: string;
    region?: string;
  };
  corsOrigins: string[];
  database: DatabaseConfig;
  graphqlPath: string;
  port: number;
  webGate: {
    basicUsername: string;
    sessionSecret: string;
    sessionTtlSeconds: number;
    sharedSecret: string;
  };
}

interface BaseEnvironment {
  apiPrefix: string;
  appStage: AppStage;
  aws: {
    parameterPrefix: string;
    region?: string;
  };
  corsOrigins: string[];
  databaseLogging: boolean;
  databaseSslRootCertPath?: string;
  graphqlPath: string;
  localDatabase: Omit<DatabaseConfig, 'logging' | 'synchronize'>;
  localWebGate: {
    basicUsername: string;
    sessionSecret: string;
    sharedSecret: string;
  };
  port: number;
  webGateSessionTtlSeconds: number;
}

let isEnvironmentLoaded = false;
let cachedAppEnvironmentPromise: Promise<AppEnvironment> | null = null;
let cachedDatabaseConfigPromise: Promise<DatabaseConfig> | null = null;

function normalizeParameterPrefix(prefix: string): string {
  const trimmedPrefix = prefix.trim();

  if (!trimmedPrefix) {
    throw new Error('AWS_SSM_PARAMETER_PREFIX must not be empty');
  }

  return `/${trimmedPrefix.replace(/^\/+|\/+$/g, '')}`;
}

function parseAppStage(rawEnv: NodeJS.ProcessEnv): AppStage {
  const rawStage = parseString(rawEnv, 'APP_STAGE', 'local').toLowerCase();

  if (rawStage === 'local' || rawStage === 'staging' || rawStage === 'production') {
    return rawStage;
  }

  throw new Error(
    `Invalid APP_STAGE "${rawStage}". Expected one of: local, staging, production`
  );
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function parseInteger(
  rawEnv: NodeJS.ProcessEnv,
  key: string,
  fallback?: number
): number {
  const rawValue = rawEnv[key];

  if (!rawValue) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing required environment variable: ${key}`);
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid integer environment variable: ${key}`);
  }

  return parsedValue;
}

function parseIntegerValue(rawValue: string, label: string): number {
  const parsedValue = Number.parseInt(rawValue, 10);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid integer value for ${label}`);
  }

  return parsedValue;
}

function parseList(
  rawEnv: NodeJS.ProcessEnv,
  key: string,
  fallback: string[]
): string[] {
  const rawValue = rawEnv[key];

  if (!rawValue) {
    return fallback;
  }

  const values = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    throw new Error(`Environment variable ${key} must contain at least one value`);
  }

  return values;
}

function parseOptionalString(
  rawEnv: NodeJS.ProcessEnv,
  key: string
): string | undefined {
  const rawValue = rawEnv[key]?.trim();

  return rawValue || undefined;
}

function parseString(
  rawEnv: NodeJS.ProcessEnv,
  key: string,
  fallback?: string
): string {
  const rawValue = parseOptionalString(rawEnv, key);

  if (rawValue) {
    return rawValue;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
}

function isLocalStage(appStage: AppStage): boolean {
  return appStage === 'local';
}

function parseBaseEnvironment(rawEnv: NodeJS.ProcessEnv): BaseEnvironment {
  return {
    apiPrefix: parseString(rawEnv, 'API_PREFIX', 'api'),
    appStage: parseAppStage(rawEnv),
    aws: {
      parameterPrefix: normalizeParameterPrefix(
        parseString(rawEnv, 'AWS_SSM_PARAMETER_PREFIX', '/deploy-flow')
      ),
      region:
        parseOptionalString(rawEnv, 'AWS_REGION') ??
        parseOptionalString(rawEnv, 'AWS_DEFAULT_REGION'),
    },
    corsOrigins: parseList(rawEnv, 'APP_CORS_ORIGINS', ['http://localhost:4200']),
    databaseLogging: parseBoolean(rawEnv.DB_LOGGING, false),
    databaseSslRootCertPath: parseOptionalString(rawEnv, 'DB_SSL_ROOT_CERT_PATH'),
    graphqlPath: parseString(rawEnv, 'GRAPHQL_PATH', 'graphql'),
    localDatabase: {
      host: parseString(rawEnv, 'DB_HOST', '127.0.0.1'),
      name: parseString(rawEnv, 'DB_NAME', 'deploy_flow'),
      password: parseString(rawEnv, 'DB_PASSWORD', 'postgres'),
      port: parseInteger(rawEnv, 'DB_PORT', 5433),
      ssl: parseBoolean(rawEnv.DB_SSL, false),
      username: parseString(rawEnv, 'DB_USERNAME', 'postgres'),
    },
    localWebGate: {
      basicUsername: parseString(
        rawEnv,
        'WEB_GATE_BASIC_USERNAME',
        'deploy-flow'
      ),
      sessionSecret: parseString(
        rawEnv,
        'WEB_GATE_SESSION_SECRET',
        'local-dev-session-secret'
      ),
      sharedSecret: parseString(
        rawEnv,
        'WEB_GATE_SHARED_SECRET',
        'local-dev-shared-secret'
      ),
    },
    port: parseInteger(rawEnv, 'APP_PORT', 3000),
    webGateSessionTtlSeconds: parseInteger(rawEnv, 'WEB_GATE_SESSION_TTL_SECONDS', 86400),
  };
}

async function loadSsmParameters(
  parameterNames: string[],
  region?: string
): Promise<Record<string, string>> {
  if (!region) {
    throw new Error(
      'AWS_REGION or AWS_DEFAULT_REGION is required to read SSM parameters'
    );
  }

  const ssmClient = new SSMClient({ region });
  const response = await ssmClient.send(
    new GetParametersCommand({
      Names: parameterNames,
      WithDecryption: true,
    })
  );

  const invalidParameters = response.InvalidParameters ?? [];

  if (invalidParameters.length > 0) {
    throw new Error(`Missing SSM parameters: ${invalidParameters.join(', ')}`);
  }

  const parameters = new Map(
    (response.Parameters ?? [])
      .filter((parameter) => parameter.Name && parameter.Value)
      .map((parameter) => [parameter.Name as string, parameter.Value as string])
  );

  return Object.fromEntries(
    parameterNames.map((parameterName) => {
      const parameterValue = parameters.get(parameterName);

      if (!parameterValue) {
        throw new Error(`Missing SSM parameter value: ${parameterName}`);
      }

      return [parameterName, parameterValue];
    })
  );
}

function buildParameterPath(
  baseEnvironment: BaseEnvironment,
  suffix: string
): string {
  return `${baseEnvironment.aws.parameterPrefix}/${baseEnvironment.appStage}/api/${suffix}`;
}

export function loadEnvironmentFiles(): void {
  if (isEnvironmentLoaded) {
    return;
  }

  const uniqueFiles = [...new Set(ENV_FILE_CANDIDATES)];

  for (const filePath of uniqueFiles) {
    if (!existsSync(filePath)) {
      continue;
    }

    loadDotenv({
      path: filePath,
    });
  }

  isEnvironmentLoaded = true;
}

export async function loadDatabaseConfig(
  rawEnv: NodeJS.ProcessEnv = process.env
): Promise<DatabaseConfig> {
  if (rawEnv === process.env && cachedDatabaseConfigPromise) {
    return cachedDatabaseConfigPromise;
  }

  loadEnvironmentFiles();

  const baseEnvironment = parseBaseEnvironment(rawEnv);
  const databaseConfigPromise = (async () => {
    if (isLocalStage(baseEnvironment.appStage)) {
      return {
        ...baseEnvironment.localDatabase,
        logging: baseEnvironment.databaseLogging,
        sslRootCertPath: baseEnvironment.databaseSslRootCertPath,
        synchronize: false as const,
      };
    }

    const databaseHostPath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.databaseHost
    );
    const databaseNamePath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.databaseName
    );
    const databasePasswordPath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.databasePassword
    );
    const databasePortPath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.databasePort
    );
    const databaseSslPath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.databaseSsl
    );
    const databaseUsernamePath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.databaseUsername
    );
    const ssmParameters = await loadSsmParameters(
      [
        databaseHostPath,
        databaseNamePath,
        databasePasswordPath,
        databasePortPath,
        databaseSslPath,
        databaseUsernamePath,
      ],
      baseEnvironment.aws.region
    );

    return {
      host: ssmParameters[databaseHostPath],
      logging: baseEnvironment.databaseLogging,
      name: ssmParameters[databaseNamePath],
      password: ssmParameters[databasePasswordPath],
      port: parseIntegerValue(ssmParameters[databasePortPath], databasePortPath),
      ssl: parseBoolean(ssmParameters[databaseSslPath], false),
      sslRootCertPath: baseEnvironment.databaseSslRootCertPath,
      synchronize: false as const,
      username: ssmParameters[databaseUsernamePath],
    };
  })();

  if (rawEnv === process.env) {
    cachedDatabaseConfigPromise = databaseConfigPromise;
  }

  return databaseConfigPromise;
}

export async function loadAppEnvironment(
  rawEnv: NodeJS.ProcessEnv = process.env
): Promise<AppEnvironment> {
  if (rawEnv === process.env && cachedAppEnvironmentPromise) {
    return cachedAppEnvironmentPromise;
  }

  loadEnvironmentFiles();

  const baseEnvironment = parseBaseEnvironment(rawEnv);
  const appEnvironmentPromise = (async () => {
    const database = await loadDatabaseConfig(rawEnv);

    if (isLocalStage(baseEnvironment.appStage)) {
      return {
        apiPrefix: baseEnvironment.apiPrefix,
        appStage: baseEnvironment.appStage,
        aws: baseEnvironment.aws,
        corsOrigins: baseEnvironment.corsOrigins,
        database,
        graphqlPath: baseEnvironment.graphqlPath,
        port: baseEnvironment.port,
        webGate: {
          basicUsername: baseEnvironment.localWebGate.basicUsername,
          sessionSecret: baseEnvironment.localWebGate.sessionSecret,
          sessionTtlSeconds: baseEnvironment.webGateSessionTtlSeconds,
          sharedSecret: baseEnvironment.localWebGate.sharedSecret,
        },
      };
    }

    const sessionSecretPath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.webGateSessionSecret
    );
    const sharedSecretPath = buildParameterPath(
      baseEnvironment,
      SSM_PATH_SUFFIXES.webGateSharedSecret
    );
    const ssmParameters = await loadSsmParameters(
      [sessionSecretPath, sharedSecretPath],
      baseEnvironment.aws.region
    );

    return {
      apiPrefix: baseEnvironment.apiPrefix,
      appStage: baseEnvironment.appStage,
      aws: baseEnvironment.aws,
      corsOrigins: baseEnvironment.corsOrigins,
      database,
      graphqlPath: baseEnvironment.graphqlPath,
      port: baseEnvironment.port,
      webGate: {
        basicUsername: baseEnvironment.localWebGate.basicUsername,
        sessionSecret: ssmParameters[sessionSecretPath],
        sessionTtlSeconds: baseEnvironment.webGateSessionTtlSeconds,
        sharedSecret: ssmParameters[sharedSecretPath],
      },
    };
  })();

  if (rawEnv === process.env) {
    cachedAppEnvironmentPromise = appEnvironmentPromise;
  }

  return appEnvironmentPromise;
}
