import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUser } from '../entities/admin-user.entity';

@Injectable()
export class AdminGuards implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const decodedToken = this.jwtService.verify(token);
      const adminUser = await this.adminUserModel.findOne({
        userId: decodedToken.sub,
        isAdmin: true,
      });

      if (!adminUser) {
        throw new UnauthorizedException(
          'You do not have the required permissions',
        );
      }

      // Attach adminUser to request for further use if needed
      request.adminUser = adminUser;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or user not authorized');
    }
  }
}
