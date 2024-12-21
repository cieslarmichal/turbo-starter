export interface QueueHandlerPayload {
  readonly data: Record<string, unknown>;
  readonly eventName: string;
}

export type QueueHandler = (payload: QueueHandlerPayload) => Promise<unknown>;
