const inherits = require('util').inherits;
const ip = require('ip');
const Channel = require('amqplib/lib/channel_model.js').Channel;

// inherit
class AMQPChannel extends Channel {
  constructor(connection, defaultHeaders) {
    super(connection);
    this.defaultHeaders = defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
  }

  publish(
    exchange,
    routingKey,
    content,
    options
  ) {
    const self = this;

    // set headers
    options = options && typeof options === 'object' ? options : {};
    options.headers = options.headers || {};

    // set default value for undefined header
    Object.keys(self.defaultHeaders).forEach((p) => {
      if (typeof options.headers[p] === 'undefined')
        options.headers[p] = self.defaultHeaders[p];
    });

    // the current machine's ip address
    options.headers.senderIP = ip.address();
    // Call the super method.
    return super.publish(exchange, routingKey, content, options);
  }
}

exports = module.exports = AMQPChannel;
exports.AMQPChannel = AMQPChannel;
