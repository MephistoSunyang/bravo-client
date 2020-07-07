import debug from 'debug';
import { environment } from '../../environments/environment.local';

debug.enable(environment.debug);
export const logger = {
  debug: debug('DEBUG:'),
  info: debug('INFO:'),
  error: debug('ERROR:'),
};
