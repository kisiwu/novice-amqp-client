var http = require("http");
var NoviceAMQClient = require("../../index");

var amqClient = new NoviceAMQClient(
  {
    protocol: "amqp",
    hostname: "192.168.99.100",
    port: 5672,
    username: "guest",
    password: "guest"
  },
  null,
  // predefined headers for all messages sent
  {
    senderPort: 3031
  }
);

var server = http.createServer(function(req, res) {
  res.statusCode = 200;
  res.end("ok");
});

server.listen(3031, function() {
  console.log("Listening on port %s", 3031);

  amqClient.connect().then(conn => {
    conn.createChannel((err, channel) => {
      if (err) {
        console.error(err);
      } else {
        channel.assertQueue('', {
          exclusive: true
        }, function(error2, q) {
          if (error2) {
            throw error2;
          }

          // create a request id
          var correlationId = Math.random().toString();
          var data = JSON.stringify({ message: 'Request from the client' });

          // waiting on the response on channel queue
          channel.consume(q.queue, function(msg) {
            if (msg.properties.correlationId == correlationId) {
              console.log(' [.] Got %s', msg.content.toString());
              console.log("from:", msg.properties.headers);
              setTimeout(function() { 
                console.log('close connection');
                conn.close();
              }, 500);
            }
          }, {
            noAck: true
          });

          // send request
          channel.sendToQueue(
            'rpc_queue',
            Buffer.from(data.toString()),
            { 
              correlationId: correlationId, 
              replyTo: q.queue 
            }
          );
        });
      }
    });
  }, console.error);
});
