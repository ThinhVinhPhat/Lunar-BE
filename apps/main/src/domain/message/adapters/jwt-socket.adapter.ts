// jwt-socket.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { BadGatewayException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ServerOptions } from 'socket.io';

@Injectable()
export class JwtSocketAdapter extends IoAdapter {
  create(port: number, options?: ServerOptions): any {
    const server = super.create(port, options);

    server.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Token is missing'));
      }

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new BadGatewayException(error.message));
      }
    });

    return server;
  }
}
