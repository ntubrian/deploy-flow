import { timingSafeEqual } from 'node:crypto';

import type { AppEnvironment } from '../config/app-env';

function extractBasicAuthorization(
  authorizationHeader: string | undefined
): { password: string; username: string } | null {
  if (!authorizationHeader?.startsWith('Basic ')) {
    return null;
  }

  const encodedCredentials = authorizationHeader.slice('Basic '.length).trim();

  try {
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
      'utf8'
    );
    const separatorIndex = decodedCredentials.indexOf(':');

    if (separatorIndex < 0) {
      return null;
    }

    return {
      password: decodedCredentials.slice(separatorIndex + 1),
      username: decodedCredentials.slice(0, separatorIndex),
    };
  } catch {
    return null;
  }
}

function safeEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const actualBuffer = Buffer.from(actual, 'utf8');

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function isBasicAuthorized(
  authorizationHeader: string | undefined,
  appEnvironment: AppEnvironment
): boolean {
  const credentials = extractBasicAuthorization(authorizationHeader);

  if (!credentials) {
    return false;
  }

  return (
    safeEqual(appEnvironment.webGate.basicUsername, credentials.username) &&
    safeEqual(appEnvironment.webGate.sharedSecret, credentials.password)
  );
}
