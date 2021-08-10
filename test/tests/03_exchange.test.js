const ip = require("ip");
const generateId = require("../generateId");

describe("Publish/Subscribe", function() {

  const { params, logger, tester } = this.ctx.kaukau;

  describe("Callback API", () => {
    let message;
    let messageContent = { data: "Data for subscribers" };

    // create sender and worker channels
    before(done => {
      let conn = tester.connection;
      let exchange = `test_many_${generateId()}`;

      let publisher = function publisher() {
        // publisher
        conn.createChannel((err, channel) => {
          if (err) {
            logger.error(err);
            done(err);
          } else {
            channel.assertExchange(exchange, "fanout", {
              durable: false
            });

            // publish to subscribers
            channel.publish(
              exchange,
              "",
              Buffer.from(JSON.stringify(messageContent))
            );

            // close channel
            channel.close();
          }
        });
      };

      // subscriber
      conn.createChannel((err, channel) => {
        if (err) {
          logger.error(err);
          done(err);
        } else {
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
                logger.error(error2);
                return done(error2);
              }

              channel.bindQueue(q.queue, exchange, "");

              channel.consume(
                q.queue,
                function(msg) {
                  message = msg;

                  // unbind queue from exchange
                  channel.unbindQueue(q.queue, exchange, "", {}, err => {
                    if (err) {
                      logger.error(
                        `could not unbind queue from exchange '${exchange}'`
                      );
                    }

                    // delete exchange
                    channel.deleteExchange(
                      exchange,
                      { ifUnused: false },
                      err2 => {
                        if (err2) {
                          logger.error(
                            `could not delete exchange '${exchange}'`
                          );
                        }
                        // close channel
                        channel.close();
                      }
                    );
                  });

                  done();
                },
                {
                  noAck: true
                }
              );

              // now that we are subscribed,
              // create a publisher that will publish
              publisher();
            }
          );
        }
      });
    });

    it("should have 'senderIP' header", function(done) {
      expect(message.properties.headers)
        .to.be.an("object")
        .that.has.property("senderIP", ip.address());
      done();
    });

    it("should have default headers", function(done) {
      let dh = params("defaultHeaders");
      expect(message.properties.headers)
        .to.be.an("object")
        .that.includes.all.keys(dh);

      // check each header value
      Object.keys(dh).forEach(k =>
        expect(message.properties.headers).to.have.property(k, dh[k])
      );
      done();
    });

    it("should have message content", function(done) {
      let content = message.content;
      expect(content).to.be.an.instanceof(Buffer);
      content = JSON.parse(content.toString());
      expect(content)
        .to.be.an("object")
        .that.has.all.keys(messageContent);

      // check each value
      Object.keys(messageContent).forEach(k =>
        expect(content).to.have.property(k, messageContent[k])
      );
      done();
    });
  });
});
