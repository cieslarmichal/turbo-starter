import { setInterval } from 'timers/promises';

import { coreSymbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../libs/logger/loggerService.js';
import { type QueueChannel } from '../libs/types/queueChannel.js';
import { type QueueController } from '../libs/types/queueController.js';
import { type QueueHandler, type QueueHandlerPayload } from '../libs/types/queueHandler.js';
import { type EmailQueueController } from '../modules/userModule/api/queueControllers/emailQueueController/emailQueueController.js';
import { userSymbols } from '../modules/userModule/symbols.js';

interface RegisterQueueControllerPayload {
  readonly controllers: QueueController[];
}

interface RegisterQueueChannelsPayload {
  readonly controllers: QueueController[];
}

export class QueueRouter {
  private readonly paths = new Map<string, QueueHandler>();

  private readonly channels: QueueChannel[] = [];

  private readonly loggerService: LoggerService;

  public constructor(private readonly container: DependencyInjectionContainer) {
    const controllers: QueueController[] = [container.get<EmailQueueController>(userSymbols.emailQueueController)];

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.registerQueueControllers({
      controllers,
    });

    this.registerQueueChannels({
      controllers,
    });
  }

  private registerQueueControllers(payload: RegisterQueueControllerPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const queuePaths = controller.getQueuePaths();

      queuePaths.forEach((handler) => {
        this.paths.set(handler.getPath(), handler.getHandler());
      });
    });
  }

  private registerQueueChannels(payload: RegisterQueueChannelsPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const channels = controller.getChannels();

      channels.forEach((channel) => {
        this.channels.push(channel);
      });
    });
  }

  private async handleQueueMessage(payload: QueueHandlerPayload): Promise<unknown> {
    const { eventName, data } = payload;

    const handler = this.paths.get(eventName);

    if (!handler) {
      this.loggerService.warn({
        message: 'A queue message was received for an unregistered path.',
        eventName,
        data,
      });

      return;
    }

    try {
      return await handler({
        data,
        eventName,
      });
    } catch (error) {
      this.loggerService.error({
        message: 'An error occurred while handling a queue message.',
        eventName,
        data,
        error,
      });

      return;
    }
  }

  private async processChannels(): Promise<void> {
    for (const channel of this.channels) {
      const messages = await channel.getMessages();

      for (const message of messages) {
        await this.handleQueueMessage(message);
      }
    }
  }

  public async start(): Promise<void> {
    const interval = setInterval(5000, async () => {
      await this.processChannels();
    });

    for await (const handler of interval) {
      await handler();
    }
  }
}
