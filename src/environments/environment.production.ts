import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debug: 'INFO:,ERROR:',
  production: true,
  ttl: 86400,
  homePath: '/system',
  loginPath: '/auth/v1/azure/ticket',
};
