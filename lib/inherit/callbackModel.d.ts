import { Connection } from 'amqplib/callback_api';
import { AMQPCallbackChannel } from './callbackChannel';

export interface AMQPCallbackModel extends Connection {
}

export class AMQPCallbackModel implements Connection {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  createChannel(callback: (err: any, channel: AMQPCallbackChannel) => void): void
}

export = AMQPCallbackModel;