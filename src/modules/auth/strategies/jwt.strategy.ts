import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

import { jwtConstants } from '../constants';

// The validate method of JwtStrategy will only be called when the token
// has been verified in terms of the encryption (corrrect secret key was used to sign it,
// and it is not expired. Only after those two things have been checked, validate is called with the payload
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessTokenSecret,
    });
  }

  // Passport will build a user object based on the return value of
  // the validate() method, and attach it as a property on the Request object
  async validate(payload: any) {
    console.log('validate in jwt strat');
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  }
}
