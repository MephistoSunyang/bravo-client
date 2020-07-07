import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debug: 'INFO:,ERROR:',
  production: true,
  ttl: 86400,
  index: '/system',
};
