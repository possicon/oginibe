import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUserModule } from './auth-user/auth-user.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'nchrys',
      password: 'puyol',
      database: 'oginibe',
      autoLoadEntities: true,
      synchronize: true,
    }),
    // UsersModule,
    // AuthUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
