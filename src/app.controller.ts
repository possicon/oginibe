import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

import { OAuth2Client } from 'google-auth-library';
import { UserAuthGuard } from './auth/guards/auth.guard';

const client = new OAuth2Client(
  '486831201775-593v60egvfdnttpaut894c8c7goq757c.apps.googleusercontent.com',
  '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',
 
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
      audience:
        '486831201775-593v60egvfdnttpaut894c8c7goq757c.apps.googleusercontent.com',
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
