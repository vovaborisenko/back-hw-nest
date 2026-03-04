import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../domain/user.entity';
import { User } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import type { CreateUserDto } from '../dto/create-user.dto';
import { BcryptService } from './bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const passwordHash = await this.bcryptService.createHash(dto.password);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFountFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
