
var inherits = require('util').inherits;
var ChannelModel = require('amqplib/lib/channel_model').ChannelModel;
var NoviceChannel = require('./NoviceChannel');

// inherit
function NoviceAMQPChannelModel(c, defaultHeaders){
    ChannelModel.call(this, c);
    this.defaultHeaders = defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}
inherits(NoviceAMQPChannelModel, ChannelModel)
NoviceAMQPChannelModel.prototype.createChannel = function createChannel(){
    // create custom channel
    var c = new NoviceChannel(this.connection, this.defaultHeaders);
    return c.open().then(function() { return c; });
};

exports = module.exports = NoviceAMQPChannelModel;