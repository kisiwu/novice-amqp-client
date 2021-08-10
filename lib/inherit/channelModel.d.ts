import { Connection } from 'amqplib';
import Bluebird from 'bluebird';
import { AMQPChannel } from './channel';

export interface AMQPModel extends Connection {
}

export class AMQPModel implements Connection {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  createChannel(): Bluebird<AMQPChannel>;
}

export = AMQPModel;