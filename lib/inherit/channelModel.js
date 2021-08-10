const inherits = require('util').inherits;
const ChannelModel = require('amqplib/lib/channel_model').ChannelModel;
const { AMQPChannel } = require('./channel');

// inherit
function AMQPModel(c, defaultHeaders) {
  ChannelModel.call(this, c);
  this.defaultHeaders =
    defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}
inherits(AMQPModel, ChannelModel);
AMQPModel.prototype.createChannel = function createChannel() {
  // create custom channel
  const c = new AMQPChannel(this.connection, this.defaultHeaders);
  return c.open().then(function () {
    return c;
  });
};

exports = module.exports = AMQPModel;
exports.AMQPModel = AMQPModel;
