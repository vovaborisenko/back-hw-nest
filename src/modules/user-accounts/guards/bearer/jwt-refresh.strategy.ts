import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

function extractJwt(req: Request) {
  return req.cookies.refreshToken;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: 'some-refresh-secret',
    });
  }

  validate(payload): unknown {
    return payload;
  }
}
