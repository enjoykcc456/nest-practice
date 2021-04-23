import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyLogger extends Logger {
  error(message: any, trace: string) {
    super.error(
      {
        message,
        logLevel: 'Error',
      },
      trace,
    );
  }

  log(message: any, trace: string) {
    super.error(
      {
        message,
        logLevel: 'Log',
      },
      trace,
    );
  }

  warn(message: any, trace: string) {
    super.error(
      {
        message,
        logLevel: 'Warn',
      },
      trace,
    );
  }

  debug(message: any, trace: string) {
    super.error(
      {
        message,
        logLevel: 'Debug',
      },
      trace,
    );
  }
}
