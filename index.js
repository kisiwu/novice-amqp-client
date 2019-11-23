var raw_connect = require('amqplib/lib/connect').connect;
var bluebird = require('bluebird');

var NoviceAMQPCallbackModel = require('./lib/inherit/NoviceCallbackModel');
var NoviceAMQPChannelModel = require('./lib/inherit/NoviceChannelModel');

// Supports three shapes:
// connect(url, options, callback)
// connect(url, callback)
// connect(callback)
function amqplibCallbackConnect(url, options, defaultHeaders, cb) {
    if (typeof url === 'function')
        cb = url, url = false, options = false;
    else if (typeof options === 'function')
        cb = options, options = false;

    raw_connect(url, options, function (err, c) {
        if (err === null) cb(null, new NoviceAMQPCallbackModel(c, defaultHeaders));
        else cb(err);
    });
};

exports = module.exports = NoviceAMQClient;

function NoviceAMQClient(connParams, socketOptions, defaultHeaders){
    this.params = connParams;
    this.socketOptions = socketOptions;

    this.defaultHeaders = defaultHeaders && typeof defaultHeaders === 'object' ? defaultHeaders : {};
}

// TODO: send a callback in connect to use Callback API. Otherwise use Promise API
NoviceAMQClient.prototype.connect = function connect(cb){
    var instance = this;

    // if callback sent, use callback api
    if(typeof cb === 'function') {

        // already existing instance's connection
        if(instance.conn){
            return cb(undefined, instance.conn);
        }

        amqplibCallbackConnect(
            instance.params, 
            instance.socketOptions, 
            instance.defaultHeaders, 
            function (err, conn) {
                instance.conn = conn;
                cb(err, conn);
            }
        );
    } else {
        // promise api
        return bluebird.fromCallback(function(cb) {
            return raw_connect(instance.params, instance.socketOptions, cb);
        })
        .then(function(conn) {
            return new NoviceAMQPChannelModel(conn, instance.defaultHeaders);
        });
    }
}