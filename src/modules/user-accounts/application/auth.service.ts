import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../guards/dto/user-context.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}

  async login(userId: string): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync({ id: userId });

    return { accessToken };
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordCorrect = await this.bcryptService.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    return { id: user._id.toString() };
  }

  // async registration(
  //   dto: RegistrationDto,
  // ): Promise<Result<null, ResultStatus.Success | ResultStatus.BadRequest>> {
  //   const result = await this.usersService.create(dto);
  //
  //   if (result.status !== ResultStatus.Success) {
  //     return result;
  //   }
  //
  //   this.emailService
  //     .sendEmail(
  //       dto.email,
  //       this.emailManager.emailConfirmation(
  //         result.data.user.emailConfirmation.confirmationCode,
  //       ),
  //       'Confirm email',
  //     )
  //     .catch((error) => console.warn(error));
  //
  //   return {
  //     status: ResultStatus.Success,
  //     extensions: [],
  //     data: null,
  //   };
  // }
  //
  // async resendConfirmationCode(
  //   dto: RegistrationEmailResendingDto,
  // ): Promise<
  //   Result<
  //     null,
  //     ResultStatus.Success | ResultStatus.BadRequest | ResultStatus.ServerError
  //   >
  // > {
  //   const userDocument = await this.usersRepository.findByEmail(dto.email);
  //
  //   if (!userDocument || userDocument.emailConfirmation.isConfirmed) {
  //     return {
  //       status: ResultStatus.BadRequest,
  //       extensions: [{ field: 'email', message: 'email is already confirmed' }],
  //       data: null,
  //     };
  //   }
  //
  //   userDocument.emailConfirmation =
  //     this.usersService.generateEmailConfirmationData();
  //
  //   this.emailService
  //     .sendEmail(
  //       dto.email,
  //       this.emailManager.emailConfirmation(
  //         userDocument.emailConfirmation.confirmationCode,
  //       ),
  //       'Confirm email',
  //     )
  //     .catch((error) => console.warn(error));
  //
  //   await this.usersRepository.save(userDocument);
  //
  //   return {
  //     status: ResultStatus.Success,
  //     extensions: [],
  //     data: null,
  //   };
  // }
  //
  // async confirmCode(
  //   dto: RegistrationConfirmationDto,
  // ): Promise<
  //   Result<
  //     null,
  //     ResultStatus.Success | ResultStatus.BadRequest | ResultStatus.ServerError
  //   >
  // > {
  //   const userDocument = await this.usersRepository.findByEmailConfirmationCode(
  //     dto.code,
  //   );
  //
  //   if (
  //     !userDocument ||
  //     userDocument.emailConfirmation.isConfirmed ||
  //     userDocument.emailConfirmation.expirationDate.valueOf() < Date.now()
  //   ) {
  //     return {
  //       status: ResultStatus.BadRequest,
  //       extensions: [{ field: 'code', message: 'code is invalid' }],
  //       data: null,
  //     };
  //   }
  //
  //   userDocument.emailConfirmation.isConfirmed = true;
  //
  //   await this.usersRepository.save(userDocument);
  //
  //   return {
  //     status: ResultStatus.Success,
  //     extensions: [],
  //     data: null,
  //   };
  // }
  //
  // async regenerateTokens({
  //   deviceId,
  //   userId,
  //   issuedAt,
  // }: RefreshTokenUpdateDto): Promise<
  //   Result<{ accessToken: string; refreshToken: string }>
  // > {
  //   const { data } = await this.jwtService.generateTokens(userId, deviceId);
  //   const refreshTokenPayload = this.jwtService.decodeRefreshToken(
  //     data.refreshToken,
  //   );
  //
  //   await this.securityDevicesService.update(
  //     { deviceId, issuedAt },
  //     {
  //       refreshToken: refreshTokenPayload,
  //     },
  //   );
  //
  //   return {
  //     status: ResultStatus.Success,
  //     extensions: [],
  //     data,
  //   };
  // }
}
