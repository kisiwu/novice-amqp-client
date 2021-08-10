const ip = require("ip");
const generateId = require("../generateId");

describe("RPC", function() {

  const { params, logger, tester } = this.ctx.kaukau;

  describe("Callback API", () => {
    let request;
    let requestContent = { data: "Request from the client" };
    let response;
    let responseContent = { data: "Response from the server" };

    // create sender and worker channels
    before(done => {
      let conn = tester.connection;
      let requestQueue = `test_rpc_${generateId()}`;

      let client = function client() {
        // client
        conn.createChannel((err, channel) => {
          if (err) {
            logger.error(err);
            done(err);
          } else {
            channel.assertQueue(
              "",
              {
                exclusive: true
              },
              function(error2, q) {
                if (error2) {
                  channel.close();
                  logger.error(error2);
                  return done(error2);
                }

                // create a request id
                let correlationId = Math.random().toString();

                // waiting on the response on channel queue
                channel.consume(
                  q.queue,
                  function(msg) {
                    if (msg.properties.correlationId == correlationId) {
                      response = msg;
                      channel.close();
                      done();
                    }
                  },
                  {
                    noAck: true
                  }
                );

                // send request
                channel.sendToQueue(
                  requestQueue,
                  Buffer.from(JSON.stringify(requestContent)),
                  {
                    correlationId: correlationId,
                    replyTo: q.queue
                  }
                );
              }
            );
          }
        });
      };

      let server = function server() {
        // server
        conn.createChannel((err, channel) => {
          if (err) {
            logger.error(err);
            done(err);
          } else {
            channel.assertQueue(requestQueue, {
              durable: false
            });

            // handle one message at a time (ACK)
            channel.prefetch(1);

            channel.consume(requestQueue, function reply(msg) {
              request = msg;

              // if there is a queue to reply to
              if (
                msg.properties.replyTo &&
                typeof msg.properties.correlationId != "undefined"
              ) {
                // reply to queue
                channel.sendToQueue(
                  msg.properties.replyTo,
                  Buffer.from(JSON.stringify(responseContent)),
                  {
                    correlationId: msg.properties.correlationId
                  }
                );

                // acknowledge message
                channel.ack(msg);

                channel.deleteQueue(requestQueue);

                channel.close();
              } else {
                // acknowledge message
                channel.ack(msg);
              }
            });

            // create client
            client();
          }
        });
      };

      // create server
      server();
    });

    // CHECK REQUEST

    it("should have 'senderIP' header in request", function(done) {
      expect(request.properties.headers)
        .to.be.an("object")
        .that.has.property("senderIP", ip.address());
      done();
    });

    it("should have default headers in request", function(done) {
      let dh = params("defaultHeaders");
      expect(request.properties.headers)
        .to.be.an("object")
        .that.includes.all.keys(dh);

      // check each header value
      Object.keys(dh).forEach(k =>
        expect(request.properties.headers).to.have.property(k, dh[k])
      );
      done();
    });

    it("should have request content", function(done) {
      let content = request.content;
      expect(content).to.be.an.instanceof(Buffer);
      content = JSON.parse(content.toString());
      expect(content)
        .to.be.an("object")
        .that.has.all.keys(requestContent);

      // check each value
      Object.keys(requestContent).forEach(k =>
        expect(content).to.have.property(k, requestContent[k])
      );
      done();
    });

    // CHECK RESPONSE

    it("should have 'senderIP' header in response", function(done) {
      expect(response.properties.headers)
        .to.be.an("object")
        .that.has.property("senderIP", ip.address());
      done();
    });

    it("should have default headers in response", function(done) {
      let dh = params("defaultHeaders");
      expect(response.properties.headers)
        .to.be.an("object")
        .that.includes.all.keys(dh);

      // check each header value
      Object.keys(dh).forEach(k =>
        expect(response.properties.headers).to.have.property(k, dh[k])
      );
      done();
    });

    it("should have response content", function(done) {
      let content = response.content;
      expect(content).to.be.an.instanceof(Buffer);
      content = JSON.parse(content.toString());
      expect(content)
        .to.be.an("object")
        .that.has.all.keys(responseContent);

      // check each value
      Object.keys(responseContent).forEach(k =>
        expect(content).to.have.property(k, responseContent[k])
      );
      done();
    });
  });
});
