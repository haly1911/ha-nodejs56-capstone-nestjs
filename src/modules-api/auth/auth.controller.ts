import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { Public } from '../../common/decorators/public.decorator';
import type { Request, Response } from 'express';
import { SignUpDto } from './dto/signup.dto';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { setAuthCookies } from '../../common/helpers/cookie.helper';
import { GoogleAuthGuard } from '../../common/guard/googleAuth.guard';
import { FRONTEND_URL } from '../../common/constant/app.constant';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  @ResponseMessage('Sign up successfully')
  @Public()
  async signUp(
    @Body()
    body: SignUpDto,
  ) {
    await this.authService.signUp(body);
    return true;
  }

  @Post('signin')
  @HttpCode(200)
  @ResponseMessage('Sign in successfully')
  @Public()
  async signIn(
    @Body()
    body: SignInDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.signIn(body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return true;
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  googleSignIn() {}

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  googleCallback(
    @Req()
    req: Request & { user: { accessToken: string; refreshToken: string } },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } = req.user;
    setAuthCookies(res, accessToken, refreshToken);
    res.redirect(`${FRONTEND_URL}/login-callback`);
  }

  @Get('get-info')
  @HttpCode(200)
  @ResponseMessage('Get info successfully')
  async getInfo(@Req() req: Request) {
    const result = await this.authService.getInfo(req);
    return result;
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ResponseMessage('Refresh token successfully')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(req);
    setAuthCookies(res, result.accessToken);
    return true;
  }
}
