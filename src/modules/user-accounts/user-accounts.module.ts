import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { BcryptService } from './application/bcrypt.service';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { JwtRefreshStrategy } from './guards/bearer/jwt-refresh.strategy';
import { PasswordService } from './application/password.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { INJECT_TOKEN } from './constants/inject-token';
import { securityDevicesHandlers } from './security-devices/application';
import { SecurityDevicesController } from './security-devices/api/security-devices.controller';
import { SecurityDevicesRepository } from './security-devices/repositories/security-devices.repository';
import { SecurityDevicesQueryRepository } from './security-devices/repositories/security-devices.query-repository';
import {
  SecurityDevice,
  SecurityDeviceSchema,
} from './security-devices/domain/security-device.entity';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SecurityDevice.name, schema: SecurityDeviceSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    AuthService,
    BasicStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BcryptService,
    PasswordService,
    {
      provide: INJECT_TOKEN.ACCESS,
      useFactory(): JwtService {
        return new JwtService({
          secret: 'some-secret', // process.env.AC_SECRET,
          signOptions: {
            expiresIn: '1h', // process.env.AC_TIME,
          },
        });
      },
    },
    {
      provide: INJECT_TOKEN.REFRESH,
      useFactory(): JwtService {
        return new JwtService({
          secret: 'some-refresh-secret',
          signOptions: {
            expiresIn: '1d',
          },
        });
      },
    },
    SecurityDevicesRepository,
    SecurityDevicesQueryRepository,
    ...securityDevicesHandlers,
  ],
})
export class UserAccountsModule {}
