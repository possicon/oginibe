import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

import { OAuth2Client } from 'google-auth-library';
import { UserAuthGuard } from './auth/guards/auth.guard';

const client = new OAuth2Client(
  
 
);
@UseGuards(UserAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  someProtectedRoute(@Req() req) {
    return { message: 'Accessed Resource', userId: req.userId };
  }
  @Post('/google')
  async loginGoogle(@Body('token') token): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:""
        
    });

    const payload = ticket.getPayload();
    const data = await this.appService.loginGoogle({
      email: payload.email,
      name: payload.name,
      // image: payload.picture
    });
    return data;
  }
}
