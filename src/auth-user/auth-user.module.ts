import { Module } from '@nestjs/common';
import { AuthUserController } from './auth-user.controller';
import { AuthUserService } from './auth-user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'your_secret_key', // Use environment variables for sensitive information
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService, JwtStrategy],
})
export class AuthUserModule {}
