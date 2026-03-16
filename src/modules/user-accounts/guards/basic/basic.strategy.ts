import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  validate(username: string, password: string): boolean {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  }
}
