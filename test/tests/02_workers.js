var kaukau = require("kaukau");
var Parameters = kaukau.Parameters;
var Tester = kaukau.Tester;
var Logger = kaukau.Logger;
var ip = require('ip');

describe("Message to workers", () => {
  var message;
  var messageContent = { data: "Data for a worker" };

  // create sender and worker channels
  before(done => {
    var conn = Tester.connection;

    conn.createChannel((err, channel) => {
      if (err) {
        Logger.error(err);
        done(err);
      } else {
        var queue = "worker";
        channel.assertQueue(queue, { durable: false });

        // worker
        channel.consume(
          queue,
          function(msg) {
            message = msg;
            // close channel
            channel.close();
            // done before
            done();
          },
          {
            noAck: true
          }
        );

        // send to a worker
        channel.sendToQueue(
          queue,
          Buffer.from(JSON.stringify(messageContent))
        );
      }
    });
  });

  it("should have 'senderIP' header", function(done) {
    expect(message.properties.headers).to.be.an('object').that.has.property('senderIP', ip.address());
    done();
  });

  it("should have default headers", function(done) {
    var dh = Parameters('defaultHeaders');
    expect(message.properties.headers).to.be.an('object').that.includes.all.keys(dh);

    // check each header value
    Object.keys(dh).forEach(
      k => expect(message.properties.headers).to.have.property(k, dh[k])
    );
    done();
  });

  it("should have message content", function(done) {
    var content = message.content;
    expect(content).to.be.an.instanceof(Buffer);
    content = JSON.parse(content.toString());
    expect(content).to.be.an('object').that.has.all.keys(messageContent);

    // check each value
    Object.keys(messageContent).forEach(
      k => expect(content).to.have.property(k, messageContent[k])
    );
    done();
  });
});
