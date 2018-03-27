var amqp = require('amqplib/callback_api');
var raw_connect = require('amqplib/lib/connect').connect;

var NoviceAMQPCallbackModel = require('./lib/inherit/NoviceCallbackModel');

// Supports three shapes:
// connect(url, options, callback)
// connect(url, callback)
// connect(callback)
function amqplibConnect(url, options, defaultHeaders, cb) {
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

NoviceAMQClient.prototype.connect = function connect(){
    var instance = this;
    return new Promise((res, rej) => {
        
        if(instance.conn){
            return res(instance.conn);
        }

        amqplibConnect(
            instance.params, 
            instance.socketOptions, 
            instance.defaultHeaders, 
            function (err, conn) {
                if (err) {
                    return rej(err);
                }

                if (!conn) {
                    return rej(conn);
                }

                instance.conn = conn;

                return res(conn);
        });
    });
}