import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

// import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './guards/admin.guard';
import { UserAuthGuard } from './guards/auth.guard';
import { OAuth2Client } from 'google-auth-library';
import { AuthGuard } from '@nestjs/passport';
import { SearchUserDto } from './dtos/search.dto';
import { User } from './schemas/user.schema';
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get('count')
  @UseGuards(UserAuthGuard)
  async getTotalUsers(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.authService.countUsers();
    return { totalUsers };
  }
  @Get('search')
  async searchUser(@Query() query: any): Promise<User[]> {
    return this.authService.searchUsers(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.authService.remove(id);
    return { message: 'User Deleted successfully' };
  }

  // @Patch(':id/make-admin')
  // @UseGuards(AdminGuard)
  // async makeAdmin(@Param('id') id: string) {
  //   return this.authService.makeAdmin(id);
  // }
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(id, updateUserDto);
  }
  @UseGuards(UserAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    await this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return { message: 'Password changed successfully' };
  }
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
    return { message: 'New Password changed successfully' };
  }
  @Post('/google-login')
  async loginGoogle(
    @Body('token') token,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('password') password: string,
  ): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const data = await this.authService.loginGoogle({
      email: payload.email,
      name: payload.name,
      image: payload.picture,
      firstName,
      lastName,
      password,
    });
    return data;
  }
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<void> {
    // Initiates the Facebook OAuth2 login flow
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req): Promise<any> {
    // Facebook will redirect here after a successful login
    return req.user;
  }
}
