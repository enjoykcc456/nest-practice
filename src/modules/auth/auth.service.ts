import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as colors from 'colors';
// import { MyInfo, Singpass } from '@govtechsg/singpass-myinfo-oidc-helper';
import * as fs from 'fs';

import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
import { Response } from 'express';
import { RequestUser } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { callPersonAPI, createTokenRequest } from 'src/common/utils';
import { Singpass, MyInfo } from '@govtechsg/singpass-myinfo-oidc-helper';
import axios from 'axios';
import { MyInfoRequest } from '@govtechsg/singpass-myinfo-oidc-helper/myinfo/helper';

colors.enable();

interface APIEndpoints {
  authoriseUrl: string;
  tokenUrl: string;
  personUrl: string;
}

interface MyInfoConfig {
  api: APIEndpoints;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  signaturePublicCert: string;
}

interface SingpassConfig {
  api: Partial<APIEndpoints>;
  redirectUrl: string;
}

export interface AuthConfig {
  myinfo: MyInfoConfig;
  singpass: SingpassConfig;
  privateKey: string;
}

export enum EnvType {
  SINGPASS = 'singpass',
  MYINFO = 'myinfo',
}

// export const attributes =
//   'uinfin,name,sex,race,nationality,dob,email,mobileno,regadd,housingtype,hdbtype,marital,edulevel,noa-basic,ownerprivate,cpfcontributions,cpfbalances';

export const attributes = 'uinfin,cpfcontributions';

@Injectable()
export class AuthService {
  private singpassHelper: Singpass.OidcHelper;
  private myInfoHelper: MyInfo.Helper;
  private myInfoTokenHelper: Singpass.OidcHelper;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    const {
      myinfo: { clientId, clientSecret, signaturePublicCert },
      privateKey,
      singpass: {
        redirectUrl,
        api: { authoriseUrl, tokenUrl },
      },
    } = authConfig;

    const myInfoPublicCertToVerifyJWS = fs.readFileSync(
      signaturePublicCert,
      'utf8',
    );
    const myInfoPrivateKeyToDecryptJWE = fs.readFileSync(privateKey, 'utf8');

    const publicCertToVerifyJWS = fs.readFileSync(
      './static/certs/spcp.crt',
      'utf8',
    );
    const privateKeyToDecryptJWE = fs.readFileSync(
      './static/certs/key.pem',
      'utf8',
    );

    this.singpassHelper = new Singpass.OidcHelper({
      authorizationUrl: authoriseUrl,
      tokenUrl: tokenUrl,
      clientID: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUrl,
      jweDecryptKey: privateKeyToDecryptJWE,
      jwsVerifyKey: publicCertToVerifyJWS,
    });

    this.myInfoHelper = new MyInfo.Helper({
      attributes: ['uinfin', 'email'],
      environment: 'test',
      clientID: clientId,
      singpassEserviceID: clientId,
      overridePersonBasicUrl: 'http://localhost:5156/myinfo/v3/person-basic',
      keyToDecryptJWE: privateKeyToDecryptJWE,
      certToVerifyJWS: publicCertToVerifyJWS,
      privateKeyToSignRequest: privateKeyToDecryptJWE,
    });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    throw new HttpException(
      'Wrong credential provided',
      HttpStatus.BAD_REQUEST,
    );
  }

  async validateRefreshToken(refreshToken: string, userId: number) {
    const user = await this.usersService.findOneById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
    throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
  }

  async login(user: any) {
    const payload: RequestUser = {
      username: user.username,
      userId: user.id,
      role: user.role,
    };

    const access_token = await this.getJwtAccessToken(payload);
    const refresh_token = await this.getJwtRefreshToken(payload);
    await this.usersService.setRefreshToken(refresh_token, user.id); // Update refresh token to db
    return { access_token, refresh_token };
  }

  async getJwtAccessToken(payload: RequestUser) {
    return await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: jwtConstants.accessTokenExpirationDuration,
    });
  }

  async getJwtRefreshToken(payload: RequestUser) {
    return await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenExpirationDuration,
    });
  }

  setJwtAccessTokenToCookie(accessToken: string, res: Response) {
    res.cookie('Authentication', accessToken, {
      maxAge: jwtConstants.accessTokenExpirationDuration * 1000,
      httpOnly: true,
    });
  }

  setJwtRefreshTokenToCookie(refreshToken: string, res: Response) {
    res.cookie('Refresh', refreshToken, {
      maxAge: jwtConstants.refreshTokenExpirationDuration * 1000,
      httpOnly: true,
    });
  }

  resetCookie(keys: string[], res: Response) {
    keys.forEach((key) => {
      res.cookie(key, '', {
        maxAge: 0,
        httpOnly: true,
      });
    });
  }

  getEnv(type: EnvType) {
    const { myinfo, singpass } = this.configService.get<AuthConfig>('auth');
    const env =
      type === EnvType.MYINFO
        ? {
            clientId: myinfo.clientId,
            redirectUrl: myinfo.redirectUrl,
            authApiUrl: myinfo.api.authoriseUrl,
            attributes: attributes,
          }
        : {
            redirectUrl: singpass.redirectUrl,
            authApiUrl: singpass.api.authoriseUrl,
          };
    console.log('ENV'.green);
    console.log(env);
    return env;
  }

  async getPersonData() {
    const data = await this.myInfoHelper.getPersonCommon('S3001316F');
    // const request = createTokenRequest(code);
    return data;
  }

  getSingpassAuthUrl() {
    const authorisationUrl = this.singpassHelper.constructAuthorizationUrl(
      'random_state',
    );
    return { authorisationUrl };
  }

  getMyInfoAuthUrl() {
    return {
      clientId: 'test-client',
      redirectUrl: 'http://localhost:3003/callback',
      authApiUrl: 'http://localhost:5156/myinfo/v3/authorise',
      attributes: ['uinfin', 'cpfcontributions'],
    };
  }

  async getSingpassToken(authCode: string) {
    const tokenResponse = await this.singpassHelper.getTokens(authCode);
    const payload = await this.singpassHelper.getIdTokenPayload(tokenResponse);
    const uinfin = await this.singpassHelper.extractNricAndUuidFromPayload(
      payload,
    );
    console.log('uinfin', uinfin);

    const personData = await this.myInfoHelper.getPersonCommon(uinfin.nric);
    console.log('personData', personData);
    return uinfin;
  }

  async getMyInfoToken(authCode: string, res: Response) {
    const request = createTokenRequest(authCode);
    request.buffer(true).end(function (callErr, callRes) {
      if (callErr) {
        // ERROR
        console.error('Token Call Error: ', callErr.status);
        console.error(callErr.response.req.res.text);
        res.jsonp({
          status: 'ERROR',
          msg: callErr,
        });
      } else {
        // SUCCESSFUL
        const data = {
          body: callRes.body,
          text: callRes.text,
        };
        console.log('Response from Token API:'.green);
        console.log(JSON.stringify(data.body));
        const accessToken = data.body.access_token;
        if (accessToken == undefined || accessToken == null) {
          res.jsonp({
            status: 'ERROR',
            msg: 'ACCESS TOKEN NOT FOUND',
          });
        }
        // everything ok, call person API
        callPersonAPI(accessToken, res);
      }
    });
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }
}
