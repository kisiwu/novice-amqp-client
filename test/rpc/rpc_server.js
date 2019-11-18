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
    senderPort: 3030
  }
);

var server = http.createServer(function(req, res) {
  res.statusCode = 200;
  res.end("ok");
});

server.listen(3030, function() {
  console.log("Listening on port %s", 3030);

  amqClient.connect().then(conn => {
    conn.createChannel((err, channel) => {
      if (err) {
        console.error(err);
      } else {
        var queue = "rpc_queue";

        channel.assertQueue(queue, {
          durable: false
        });

        // handle one message at a time (ACK)
        channel.prefetch(1);

        console.log(" [x] Awaiting RPC requests");
        channel.consume(queue, function reply(msg) {
          if (msg.content) {
            console.log(" [x] %s", msg.content.toString());
          }
          console.log("from:", msg.properties.headers);

          var response = JSON.stringify({
            message: "Response from the server"
          });

          // if there is a queue to reply to
          if (
            msg.properties.replyTo &&
            typeof msg.properties.correlationId != "undefined"
          ) {
            // reply to queue
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(response), {
              correlationId: msg.properties.correlationId
            });
          }

          // acknowledge message
          channel.ack(msg);
        });
      }
    });
  }, console.error);
});
