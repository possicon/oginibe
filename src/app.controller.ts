import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';


import { UserAuthGuard } from './auth/guards/auth.guard';


@UseGuards(UserAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


}
