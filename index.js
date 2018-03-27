var inherits = require('util').inherits;
var ip = require('ip');
var amqp = require('amqplib/callback_api');
var raw_connect = require('amqplib/lib/connect').connect;
var Channel = require('amqplib/lib/callback_model.js').Channel;
var CallbackModel = require('amqplib/lib/callback_model').CallbackModel;

// inherit
function NoviceAMQPCallbackModel(c){
    CallbackModel.call(this, c);
}
inherits(NoviceAMQPCallbackModel, CallbackModel)
NoviceAMQPCallbackModel.prototype.createChannel = function createChannel(cb){
    // create custom channel
    var ch = new NoviceAMQPChannel(this.connection);
    ch.open(function (err, ok) {
        if (err === null) cb && cb(null, ch);
        else cb && cb(err);
    });
    return ch;
};

// inherit
function NoviceAMQPChannel(connection){
    Channel.call(this, connection);
}
inherits(NoviceAMQPChannel, Channel)
NoviceAMQPChannel.prototype.publish = function(exchange, routingKey, content, options) {
    // set headers
    options = options && typeof options === 'object' ? options : {};
    options.headers = options.headers || {};
    options.headers.senderIP = ip.address();
    // Call the super method.
    Channel.prototype.publish.call(this, exchange, routingKey, content, options);
};

// Supports three shapes:
// connect(url, options, callback)
// connect(url, callback)
// connect(callback)
function amqplibConnect(url, options, cb) {
    if (typeof url === 'function')
        cb = url, url = false, options = false;
    else if (typeof options === 'function')
        cb = options, options = false;

    raw_connect(url, options, function (err, c) {
        if (err === null) cb(null, new NoviceAMQPCallbackModel(c));
        else cb(err);
    });
};

exports = module.exports = NoviceAMQClient;

function NoviceAMQClient(connParams, socketOptions){
    this.params = connParams;
    this.socketOptions = socketOptions;
}

NoviceAMQClient.prototype.connect = function connect(){
    var instance = this;
    return new Promise((res, rej) => {
        
        if(instance.conn){
            return res(instance.conn);
        }

        amqplibConnect(instance.params, instance.socketOptions, function (err, conn) {
            if(err){
                console.error("ERROR");
                
                return rej(err);
            }

            if(!conn){
                console.error("NO CONNECTION");
                return rej(conn);
            }

            instance.conn = conn;

            return res(conn);
        });
    });
}