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
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { PasswordService } from './application/password.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    JwtModule.register({
      secret: 'some-secret', // process.env.AC_SECRET,
      signOptions: {
        expiresIn: '1h', // process.env.AC_TIME,
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    AuthService,
    BasicStrategy,
    JwtStrategy,
    LocalStrategy,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BcryptService,
    PasswordService,
  ],
})
export class UserAccountsModule {}
