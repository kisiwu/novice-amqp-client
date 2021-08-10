import { Connection } from 'amqplib/callback_api';
import AMQPCallbackChannel from './callbackChannel';

declare interface AMQPCallbackModel extends Connection {
}

class AMQPCallbackModel extends Connection {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  createChannel(callback: (err: any, channel: AMQPCallbackChannel) => void): void
}

export = AMQPCallbackModel;