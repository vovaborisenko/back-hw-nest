import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenDto } from '../dto/user-context.dto';
import { SecurityDevicesRepository } from '../../security-devices/repositories/security-devices.repository';
import { parseJwtTime } from '../../../../core/utils/parse-jwt-time';

function extractJwt(req: Request) {
  return req.cookies.refreshToken;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: 'some-refresh-secret',
    });
  }

  async validate(payload: RefreshTokenDto): Promise<RefreshTokenDto | null> {
    const device = await this.securityDevicesRepository.findBy({
      deviceId: payload.deviceId,
      userId: payload.id,
      issuedAt: parseJwtTime(payload.iat),
    });

    if (!device) {
      return null;
    }

    return payload;
  }
}
