export interface QueueMessagePayload {
  readonly data: Record<string, unknown>;
  readonly eventName: string;
}

export interface QueueChannel {
  getMessages(): Promise<QueueMessagePayload[]>;
}
