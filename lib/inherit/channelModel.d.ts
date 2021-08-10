import { Connection } from 'amqplib';
import Bluebird from 'bluebird';
import AMQPChannel from './channel';

declare interface AMQPModel extends Connection {
}

class AMQPModel extends Connection {
  constructor(connection: any, defaultHeaders?: Record<string, any>);

  createChannel(): Bluebird<AMQPChannel>;
}

export = AMQPModel;