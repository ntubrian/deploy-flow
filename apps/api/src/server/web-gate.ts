import { type Request, type RequestHandler, type Response } from 'express';

import { isBasicAuthorized } from './basic-auth';

import type { AppEnvironment } from '../config/app-env';

function isAuthenticatedRequest(
  request: Request,
  appEnvironment: AppEnvironment
): boolean {
  return isBasicAuthorized(request.header('authorization'), appEnvironment);
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

  return (request, response, next) => {
    if (request.method === 'OPTIONS' || request.path === healthPath) {
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
