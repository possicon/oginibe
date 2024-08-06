import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:12345@nchrys.gpcjv.mongodb.net/oginibe?authSource=admin&replicaSet=atlas-8wkpir-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true',
    ),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
