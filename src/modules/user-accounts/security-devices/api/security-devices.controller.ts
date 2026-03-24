import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { PARAM, PATH } from '../../../../core/constants/paths';

const { PREFIX, SINGLE } = PATH.DEVICES;

@Controller(PREFIX)
export class SecurityDevicesController {
  @Get()
  getAllDevices() {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDevices() {}

  @Delete(SINGLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDevice(@Param(PARAM.ID) deviceId: string) {
    console.log(deviceId);
  }
}
