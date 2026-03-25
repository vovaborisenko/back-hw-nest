import { GetSecurityDevicesQueryHandler } from './queries/get-security-devices.query';
import { CreateSecurityDeviceUseCase } from './usecases/create-security-devices.usecase';

export const securityDevicesHandlers = [
  GetSecurityDevicesQueryHandler,
  CreateSecurityDeviceUseCase,
];
