import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debug: 'DEBUG:,INFO:,ERROR:',
  production: true,
  ttl: 86400,
  homePath: '/home',
  loginPath: '/login',
};
