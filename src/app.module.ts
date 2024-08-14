import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { User, UserSchema } from './auth/schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRoot(
      'mongodb+srv://admin:12345@nchrys.gpcjv.mongodb.net/oginibeApp?authSource=admin&replicaSet=atlas-8wkpir-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true',
    ),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config) => ({
    //     uri: config.get('database.connectionString'),
    //   }),
    //   inject: [ConfigService],
    // }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
