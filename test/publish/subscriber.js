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
        var exchange = "many";

        channel.assertExchange(exchange, "fanout", {
          durable: false
        });

        channel.assertQueue(
          "",
          {
            // if exclusive, when the connection that declared the queue closes, the queue will be deleted
            exclusive: true
          },
          function(error2, q) {
            if (error2) {
              throw error2;
            }
            console.log(
              " [*] Waiting for messages in %s. To exit press CTRL+C",
              q.queue
            );
            channel.bindQueue(q.queue, exchange, "");

            channel.consume(
              q.queue,
              function(msg) {
                if (msg.content) {
                  console.log(" [x] %s", msg.content.toString());
                }
                console.log("from:", msg.properties.headers);
              },
              {
                noAck: true
              }
            );
          }
        );
      }
    });
  }, console.error);
});
