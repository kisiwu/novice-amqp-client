var kaukau = require("kaukau");
var Parameters = kaukau.Parameters;
var Tester = kaukau.Tester;
var Logger = kaukau.Logger;
var ip = require("ip");

describe("Publish with exchanger", () => {
  var message;
  var messageContent = { data: "Data for subscribers" };

  // create sender and worker channels
  before(done => {
    var conn = Tester.connection;
    var exchange = "many";

    var publisher = function publisher() {
      // publisher
      conn.createChannel((err, channel) => {
        if (err) {
          Logger.error(err);
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
        Logger.error(err);
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
              Logger.error(error2);
              return done(error2);
            }

            channel.bindQueue(q.queue, exchange, "");

            channel.consume(
              q.queue,
              function(msg) {
                message = msg;

                // close channel
                channel.close();
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
    var dh = Parameters("defaultHeaders");
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
    var content = message.content;
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
