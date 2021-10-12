import { Logger, Color } from '../../lib/logger/logger';

export class NullLogger extends Logger {
  debug(message?: string): void {}
  info(message?: string): void {}
  warn(message?: string): void {}
  error(message?: string): void {}
  format(message: string, color: Color): string {
    return message;
  }
  create() {
    return new NullLogger();
  }
}
