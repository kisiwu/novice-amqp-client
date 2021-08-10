const inherits = require('util').inherits;
const ip = require('ip');
const Channel = require('amqplib/lib/callback_model.js').Channel;

// inherit
function AMQPCallbackChannel(connection, defaultHeaders) {
  Channel.call(this, connection);
  this.defaultHeaders =
    defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}
inherits(AMQPCallbackChannel, Channel);
AMQPCallbackChannel.prototype.publish = function (
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
  Channel.prototype.publish.call(this, exchange, routingKey, content, options);
};

exports = module.exports = AMQPCallbackChannel;
exports.AMQPCallbackChannel = AMQPCallbackChannel;
