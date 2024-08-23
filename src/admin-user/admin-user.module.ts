import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUser, AdminUserSchema } from './entities/admin-user.entity';

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
  providers: [AdminUserService],
})
export class AdminUserModule {}
