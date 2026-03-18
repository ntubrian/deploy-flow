import { type Request, type RequestHandler, type Response } from 'express';
import { Kind, parse, type OperationDefinitionNode } from 'graphql';
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

function isAuthenticatedRequest(
  request: Request,
  appEnvironment: AppEnvironment
): boolean {
  const credentials = extractBasicAuthorization(request.header('authorization'));

  if (!credentials) {
    return false;
  }

  return (
    safeEqual(appEnvironment.webGate.basicUsername, credentials.username) &&
    safeEqual(appEnvironment.webGate.sharedSecret, credentials.password)
  );
}

function extractGraphqlRequestSource(request: Request): string | undefined {
  const bodyQuery =
    typeof request.body?.query === 'string' ? request.body.query : undefined;

  if (bodyQuery) {
    return bodyQuery;
  }

  const queryString = request.query.query;

  return typeof queryString === 'string' ? queryString : undefined;
}

function extractOperationName(request: Request): string | undefined {
  const bodyOperationName =
    typeof request.body?.operationName === 'string'
      ? request.body.operationName
      : undefined;

  if (bodyOperationName) {
    return bodyOperationName;
  }

  const queryOperationName = request.query.operationName;

  return typeof queryOperationName === 'string' ? queryOperationName : undefined;
}

function getSelectedOperation(
  request: Request
): OperationDefinitionNode | undefined {
  const source = extractGraphqlRequestSource(request);

  if (!source) {
    return undefined;
  }

  try {
    const document = parse(source);
    const operationName = extractOperationName(request);
    const operations = document.definitions.filter(
      (definition): definition is OperationDefinitionNode =>
        definition.kind === Kind.OPERATION_DEFINITION
    );

    if (operationName) {
      return operations.find(
        (operation) => operation.name?.value === operationName
      );
    }

    return operations.length === 1 ? operations[0] : undefined;
  } catch {
    return undefined;
  }
}

function isHealthOnlyGraphqlRequest(request: Request): boolean {
  const operation = getSelectedOperation(request);

  if (!operation || operation.operation !== 'query') {
    return false;
  }

  return (
    operation.selectionSet.selections.length === 1 &&
    operation.selectionSet.selections[0]?.kind === Kind.FIELD &&
    operation.selectionSet.selections[0].name.value === 'health'
  );
}

function challenge(response: Response): void {
  response
    .setHeader('WWW-Authenticate', 'Basic realm="Deploy Flow"')
    .status(401)
    .json({
      error: 'Unauthorized',
    });
}

export function createWebGateMiddleware(
  appEnvironment: AppEnvironment
): RequestHandler {
  if (appEnvironment.appStage === 'local') {
    return (_request, _response, next) => {
      next();
    };
  }

  const healthPath = '/health';
  const graphqlPath = `/${appEnvironment.graphqlPath}`;

  return (request, response, next) => {
    if (request.method === 'OPTIONS' || request.path === healthPath) {
      next();
      return;
    }

    if (
      request.path === graphqlPath &&
      isHealthOnlyGraphqlRequest(request)
    ) {
      next();
      return;
    }

    if (!isAuthenticatedRequest(request, appEnvironment)) {
      challenge(response);
      return;
    }

    next();
  };
}
