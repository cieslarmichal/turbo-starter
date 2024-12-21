import { Application } from './core/application.js';
import { serializeError } from './libs/errors/serializeError.js';

export const finalErrorHandler = async (error: unknown): Promise<void> => {
  const serializedError = serializeError(error);

  console.error({
    message: 'Application error.',
    context: serializedError,
  });

  Application?.stop();

  process.exit(1);
};

process.on('unhandledRejection', finalErrorHandler);

process.on('uncaughtException', finalErrorHandler);

process.on('SIGINT', finalErrorHandler);

process.on('SIGTERM', finalErrorHandler);

try {
  await Application.start();
} catch (error) {
  await finalErrorHandler(error);
}
