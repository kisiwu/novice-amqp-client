import { Options } from 'amqplib'
import Bluebird from 'bluebird'
import AMQPCallbackModel from './lib/inherit/callbackModel'
import AMQPModel from './lib/inherit/channelModel'

declare interface AMQPClient { }

class AMQPClient {
  constructor(url: string | Options.Connect, socketOptions?: Options.Connect | null, defaultHeaders?: Record<string, any>);

  connect(openCallback: (err: any, connection: AMQPCallbackModel) => void): void;
  connect(): Bluebird<AMQPModel>;
}

export = AMQPClient;