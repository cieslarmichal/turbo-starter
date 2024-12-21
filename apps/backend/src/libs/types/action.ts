export interface Action<Payload, Result> {
  execute(payload: Payload): Promise<Result>;
}
