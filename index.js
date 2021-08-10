const raw_connect = require('amqplib/lib/connect').connect;
const bluebird = require('bluebird');

const AMQPCallbackModel = require('./lib/inherit/callbackModel');
const AMQPModel = require('./lib/inherit/channelModel');

// Supports three shapes:
// connect(url, options, callback)
// connect(url, callback)
// connect(callback)
function amqplibCallbackConnect(url, options, defaultHeaders, cb) {
  if (typeof url === 'function') (cb = url), (url = false), (options = false);
  else if (typeof options === 'function') (cb = options), (options = false);

  raw_connect(url, options, function (err, c) {
    if (err === null) cb(null, new AMQPCallbackModel(c, defaultHeaders));
    else cb(err);
  });
}

exports = module.exports = AMQPClient;

function AMQPClient(url, socketOptions, defaultHeaders) {
  this.url = url;
  this.socketOptions = socketOptions;

  this.defaultHeaders =
    defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}

// TODO: send a callback in connect to use Callback API. Otherwise use Promise API
AMQPClient.prototype.connect = function connect(cb) {
  const instance = this;

  // if callback sent, use callback api
  if (typeof cb === 'function') {
    // already existing instance's connection
    if (instance.conn) {
      return cb(undefined, instance.conn);
    }

    amqplibCallbackConnect(
      instance.url,
      instance.socketOptions,
      instance.defaultHeaders,
      function (err, conn) {
        instance.conn = conn;
        cb(err, conn);
      }
    );
  } else {
    // promise api
    return bluebird
      .fromCallback(function (cb) {
        return raw_connect(instance.url, instance.socketOptions, cb);
      })
      .then(function (conn) {
        return new AMQPModel(conn, instance.defaultHeaders);
      });
  }
};
