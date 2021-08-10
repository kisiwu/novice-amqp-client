import { Channel, Options } from 'amqplib/callback_api'

export interface AMQPCallbackChannel extends Channel {
}

export class AMQPCallbackChannel implements Channel {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  publish(exchange: string, routingKey: string, content: Buffer, options?: Options.Publish): boolean;
}

export = AMQPCallbackChannel;
