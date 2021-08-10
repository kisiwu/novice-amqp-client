const inherits = require('util').inherits;
const CallbackModel = require('amqplib/lib/callback_model').CallbackModel;
const { AMQPCallbackChannel } = require('./callbackChannel');

// inherit
function AMQPCallbackModel(c, defaultHeaders) {
  CallbackModel.call(this, c);
  this.defaultHeaders =
    defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}
inherits(AMQPCallbackModel, CallbackModel);
AMQPCallbackModel.prototype.createChannel = function createChannel(cb) {
  // create custom channel
  const ch = new AMQPCallbackChannel(this.connection, this.defaultHeaders);
  ch.open(function (err, ok) {
    if (err === null) cb && cb(null, ch);
    else cb && cb(err);
  });
  return ch;
};

exports = module.exports = AMQPCallbackModel;
exports.AMQPCallbackModel = AMQPCallbackModel;
