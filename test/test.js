var http = require('http')
var NoviceAMQClient = require('../index')

var amqClient = new NoviceAMQClient({
    protocol: 'amqp',
    hostname: '192.168.99.100',
    port: 5672,
    username: 'guest',
    password: 'guest'
  }, null, {
    senderPort:  3030
});


var server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.end('ok');
});

server.listen(3030, function(){
    console.log('Listening on port %s', 3030);

    amqClient.connect().then(
        (conn) => {

            conn.createChannel((err, channel) => {
                if(err){
                    console.error(err);
                }
                else{
                    /*
                    // fanout (BROADCAST)
                    var ex = 'add:route';
                    channel.assertExchange(ex, 'fanout', { durable: false });
                    channel.publish(ex, '', new Buffer(JSON.stringify({path: '/'})));
                    */

                    // send to queue
                    var q = 'hello';
                    channel.assertQueue(q, { durable: false });
                    // Note: on Node 6 Buffer.from(msg) should be used
                    channel.sendToQueue(q, new Buffer(new Buffer(JSON.stringify({ path: '/', method: 'get' }))));
                }
                
                setTimeout(() => {
                    console.log('close connection');
                    conn.close();
                }, 5000);
            });
        },
        console.error
    );

});