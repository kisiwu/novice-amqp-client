var http = require('http')
var NoviceAMQClient = require('../index')

var amqClient = new NoviceAMQClient({
    protocol: 'amqp',
    hostname: '192.168.99.100',
    port: 5672,
    username: 'guest',
    password: 'guest'
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
                    var ex = 'add:route';

                /**
                 * fanout (BROADCAST)
                 */
                    channel.assertExchange(ex, 'fanout', { durable: false });

                    console.log("fanout");

                    channel.publish(ex, '', new Buffer(JSON.stringify({path: '/'})));
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