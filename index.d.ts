import { Options } from 'amqplib'
import Bluebird from 'bluebird'
import { AMQPCallbackModel } from './lib/inherit/callbackModel'
import { AMQPModel } from './lib/inherit/channelModel'

export interface AMQPClient { }

export class AMQPClient<Opts extends Options.Connect = Options.Connect> {
  constructor(url: string | Options.Connect, socketOptions?: Opts | null, defaultHeaders?: Record<string, any>);

  connect(openCallback: (err: any, connection: AMQPCallbackModel) => void): void;
  connect(): Bluebird<AMQPModel>;
}

export = AMQPClient;