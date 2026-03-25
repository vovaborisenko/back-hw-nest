import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PARAM, PATH } from '../../../../core/constants/paths';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetSecurityDevicesQuery } from '../application/queries/get-security-devices.query';
import { SecurityDeviceViewDto } from './view-dto/security-device.view-dto';
import { JwtRefreshAuthGuard } from '../../guards/bearer/jwt-refresh-auth.guard';
import { ExtractUserFromRequestDecorator } from '../../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../guards/dto/user-context.dto';

const { PREFIX, SINGLE } = PATH.DEVICES;

@UseGuards(JwtRefreshAuthGuard)
@Controller(PREFIX)
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getAllDevices(
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<SecurityDeviceViewDto[]> {
    return this.queryBus.execute(new GetSecurityDevicesQuery(user.id));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDevices() {}

  @Delete(SINGLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDevice(@Param(PARAM.ID) deviceId: string) {
    console.log(deviceId);
  }
}
