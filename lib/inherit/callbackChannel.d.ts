import { Channel, Options } from 'amqplib/callback_api'

declare interface AMQPCallbackChannel extends Channel {
}

class AMQPCallbackChannel extends Channel {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  publish(exchange: string, routingKey: string, content: Buffer, options?: Options.Publish): boolean;
}

export = AMQPCallbackChannel;
