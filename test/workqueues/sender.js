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
        var q = "worker";
        channel.assertQueue(q, { durable: false });

        // send to worker
        // Note: on Node 6 Buffer.from(msg) should be used
        channel.sendToQueue(
          q,
          Buffer.from(JSON.stringify({ message: "Data for a worker" }))
        );
      }

      setTimeout(() => {
        console.log("close connection");
        conn.close();
      }, 5000);
    });
  }, console.error);
});
