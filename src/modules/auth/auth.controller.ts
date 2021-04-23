import {
  Controller,
  Post,
  Res,
  Req,
  UseGuards,
  Get,
  HttpStatus,
  Param,
  Body,
  UseInterceptors,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { callPersonAPI, createTokenRequest } from 'src/common/utils';

import { Auth, AuthEnum, Role } from 'src/decorators/auth.decorator';
import { Cookies } from 'src/decorators/cookie.decorator';
import { UsersService } from '../users/users.service';
import { GetTokenDto } from './auth.dto';
import { AuthService, EnvType } from './auth.service';
import JwtRefreshAuthGuard from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

export interface RequestUser {
  userId: number;
  username: string;
  role: Role;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @Auth(AuthEnum.PUBLIC)
  @UseGuards(LocalAuthGuard) // Implement Passport authentication and populate req with user if success
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(req.user);
    this.authService.setJwtAccessTokenToCookie(tokens.access_token, res);
    this.authService.setJwtRefreshTokenToCookie(tokens.refresh_token, res);
    return tokens;
  }

  @Post('logout')
  @Auth(AuthEnum.ANY_ROLE)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.authService.resetCookie(['Authentication', 'Refresh'], res);
    await this.usersService.removeRefreshToken(req.user.userId);
    res.status(HttpStatus.NO_CONTENT);
  }

  @Auth(AuthEnum.PUBLIC)
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refresh(
    @Cookies('Refresh') refresh_token: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.validateRefreshToken(refresh_token, req.user.userId);
    const newAccessToken = await this.authService.getJwtAccessToken(req.user);
    this.authService.setJwtAccessTokenToCookie(newAccessToken, res);
    return { access_token: newAccessToken };
  }

  @Auth(AuthEnum.PUBLIC)
  @Get('getEnv/:type')
  getEnv(@Param('type') type: EnvType) {
    return this.authService.getEnv(type);
  }

  @Auth(AuthEnum.PUBLIC)
  @Post('getPersonData')
  async getPersonData(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // return await this.authService.getPersonData();
    const authCode = req.body.code;
    await this.authService.getMyInfoToken(authCode, res);
  }

  @Auth(AuthEnum.PUBLIC)
  @Get('singpass')
  async getSingpassAuthUrl(@Res() res: Response) {
    // return this.authService.getSingpassAuthUrl();
    const { authorisationUrl } = await this.authService.getSingpassAuthUrl();
    res.redirect(authorisationUrl);
  }

  @Auth(AuthEnum.PUBLIC)
  @Get('myinfo')
  getMyInfoAuthUrl() {
    return this.authService.getMyInfoAuthUrl();
  }

  @Auth(AuthEnum.PUBLIC)
  @Post('singpass/token')
  getSingpassToken(@Body() getTokenDto: GetTokenDto) {
    const { code } = getTokenDto;
    return this.authService.getSingpassToken(code);
  }

  @Auth(AuthEnum.PUBLIC)
  @Post('myinfo/token')
  async getMyInfoToken(@Body() getTokenDto: GetTokenDto, @Res() res: Response) {
    const { code } = getTokenDto;
    await this.authService.getMyInfoToken(code, res);
  }

  @Auth(AuthEnum.PUBLIC)
  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleLogin() {
    return {};
  }

  @Auth(AuthEnum.PUBLIC)
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    res.redirect('http://localhost:3003/callback');
  }
}
