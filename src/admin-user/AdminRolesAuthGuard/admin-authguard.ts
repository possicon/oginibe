import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      // Check if the user is an admin
      if (!payload.isAdmin) {
        throw new UnauthorizedException('Admin privileges required');
      }
    } catch (e) {
      Logger.error(e.message);
      throw new UnauthorizedException('Invalid Token, User is not an admin');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}

// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class AdminAuthGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     // Assuming you have a way to identify if the user is an admin
//     return user && user.isAdmin;
//   }
// }
