import { Channel, Options } from 'amqplib';

export interface AMQPChannel extends Channel {
}

export class AMQPChannel implements Channel {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  publish(exchange: string, routingKey: string, content: Buffer, options?: Options.Publish): boolean;
}

export = AMQPChannel;
