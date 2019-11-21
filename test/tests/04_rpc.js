var kaukau = require("kaukau");
var Parameters = kaukau.Parameters;
var Tester = kaukau.Tester;
var Logger = kaukau.Logger;
var ip = require("ip");
var generateId = require('../generateId');

describe("RPC", () => {
  var request;
  var requestContent = { data: "Request from the client" };
  var response;
  var responseContent = { data: "Response from the server" };

  // create sender and worker channels
  before(done => {
    var conn = Tester.connection;
    var requestQueue = `test_rpc_${generateId()}`;

    var client = function client() {
      // client
      conn.createChannel((err, channel) => {
        if (err) {
          Logger.error(err);
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
                Logger.error(error2);
                return done(error2);
              }

              // create a request id
              var correlationId = Math.random().toString();

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

    var server = function server() {
      // server
      conn.createChannel((err, channel) => {
        if (err) {
          Logger.error(err);
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
    var dh = Parameters("defaultHeaders");
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
    var content = request.content;
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
    var dh = Parameters("defaultHeaders");
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
    var content = response.content;
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
