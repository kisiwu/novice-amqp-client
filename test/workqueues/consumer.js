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
        var q = "worker";

        // This makes sure the queue is declared before attempting to consume from it
        channel.assertQueue(q, { durable: false });

        // consume
        channel.consume(
          q,
          function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            console.log("from:", msg.properties.headers);
          },
          {
            // automatic acknowledgment mode
            noAck: true
          }
        );
      }
    });
  }, console.error);
});
