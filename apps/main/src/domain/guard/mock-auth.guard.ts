import { IS_PUBLIC_KEY } from '@app/decorator/public.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log('Authorization Header:', request.headers['authorization']);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const authHeader = request.headers['authorization'];
    return authHeader?.trim().toLowerCase() === 'bearer mock-token';
  }
}
