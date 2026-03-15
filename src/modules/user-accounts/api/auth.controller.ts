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
import { PasswordService } from '../application/password.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { PasswordUpdateInputDto } from './input-dto/password-update.input-dto';

const { PREFIX, ...URL } = PATH.AUTH;

@Controller(PREFIX)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
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
  async updatePassword(@Body() body: PasswordUpdateInputDto) {
    await this.passwordService.changePasswordByRecoveryCode(body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.PASSWORD_RECOVERY)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    await this.passwordService.sendRecoveryCode(body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.REGISTRATION)
  async registration(@Body() body: CreateUserInputDto) {
    await this.authService.registration(body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.REG_CONFIRMATION)
  async registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ) {
    await this.authService.confirmCode(body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(URL.REG_EMAIL_RESENDING)
  async registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ) {
    await this.authService.resendConfirmationCode(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(URL.ME)
  getMe(
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<MeViewDto> {
    return this.usersQueryRepository.getMeOrFail(user.id);
  }
}
