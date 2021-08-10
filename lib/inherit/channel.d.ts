import { Channel, Options } from 'amqplib';

declare interface AMQPChannel extends Channel {
}

class AMQPChannel extends Channel {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  publish(exchange: string, routingKey: string, content: Buffer, options?: Options.Publish): boolean;
}

export = AMQPChannel;
