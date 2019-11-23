
var inherits = require('util').inherits;
var CallbackModel = require('amqplib/lib/callback_model').CallbackModel;
var NoviceCallbackChannel = require('./NoviceCallbackChannel');

// inherit
function NoviceAMQPCallbackModel(c, defaultHeaders){
    CallbackModel.call(this, c);
    this.defaultHeaders = defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}
inherits(NoviceAMQPCallbackModel, CallbackModel)
NoviceAMQPCallbackModel.prototype.createChannel = function createChannel(cb){
    // create custom channel
    var ch = new NoviceCallbackChannel(this.connection, this.defaultHeaders);
    ch.open(function (err, ok) {
        if (err === null) cb && cb(null, ch);
        else cb && cb(err);
    });
    return ch;
};

exports = module.exports = NoviceAMQPCallbackModel;