import { Response, Request } from 'express';
import { json } from 'body-parser';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

function rawBodyMiddleware() {
  return json({
    verify: (
      request: RequestWithRawBody,
      response: Response,
      buffer: Buffer,
    ) => {
      if (request.url === '/api/v1/webhook/stripe' && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }
      return true;
    },
  });
}

export default rawBodyMiddleware;
