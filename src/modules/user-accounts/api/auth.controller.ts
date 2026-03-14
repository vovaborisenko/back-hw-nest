import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { LoginViewDto } from './view-dto/login.view-dto';
import { AuthService } from '../application/auth.service';
import { ExtractUserFromRequestDecorator } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { PATH } from '../../../core/constants/paths';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { MeViewDto } from './view-dto/me.view-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';

const { PREFIX, ...URL } = PATH.AUTH;

@Controller(PREFIX)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post(URL.LOGIN)
  login(
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<LoginViewDto> {
    return this.authService.login(user.id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.NEW_PASSWORD)
  updatePassword() {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.PASSWORD_RECOVERY)
  passwordRecovery(@Body() body: PasswordRecoveryInputDto) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.REGISTRATION)
  registration() {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.REG_CONFIRMATION)
  registrationConfirmation() {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.REG_EMAIL_RESENDING)
  registrationEmailResending() {}

  @UseGuards(JwtAuthGuard)
  @Get(URL.ME)
  getMe(
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<MeViewDto> {
    return this.usersQueryRepository.getMeOrFail(user.id);
  }
}
