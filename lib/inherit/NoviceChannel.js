var inherits = require('util').inherits;
var ip = require('ip');
var Channel = require('amqplib/lib/channel_model.js').Channel;


// inherit
function NoviceAMQPChannel(connection, defaultHeaders){
    Channel.call(this, connection);
    this.defaultHeaders = defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}
inherits(NoviceAMQPChannel, Channel)
NoviceAMQPChannel.prototype.publish = function(exchange, routingKey, content, options) {
    var self = this;

    // set headers
    options = options && typeof options === 'object' ? options : {};
    options.headers = options.headers || {};

    // set default value for undefined header
    Object.keys(self.defaultHeaders).forEach( p => {
        if(typeof options.headers[p] === 'undefined')
            options.headers[p] = self.defaultHeaders[p];
    });

    // the current machine's ip address
    options.headers.senderIP = ip.address();
    // Call the super method.
    Channel.prototype.publish.call(this, exchange, routingKey, content, options);
};

exports = module.exports = NoviceAMQPChannel;