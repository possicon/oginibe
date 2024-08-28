import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminAuthGuard } from './AdminRolesAuthGuard/admin-authguard';
import { AdminUser, AdminUserSchema } from './entities/admin-user.entity';
import { AdminGuards } from './AdminRolesAuthGuard/adminguard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdminUser.name,
        schema: AdminUserSchema,
      },
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService, AdminAuthGuard, AdminGuards],
})
export class AdminUserModule {}
