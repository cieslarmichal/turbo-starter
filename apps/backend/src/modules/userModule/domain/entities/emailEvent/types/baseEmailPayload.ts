export interface BaseEmailPayload {
  readonly recipientEmail: string;
  readonly name: string;
  readonly [key: string]: unknown;
}
