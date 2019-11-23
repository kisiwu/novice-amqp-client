var kaukau = require("kaukau");
var Parameters = kaukau.Parameters;
var Tester = kaukau.Tester;
var Logger = kaukau.Logger;
var ip = require("ip");
var generateId = require("../generateId");

describe("Work queues", () => {
  describe("Callback API", () => {
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
          var workQueue = `test_worker_${generateId()}`;
          channel.assertQueue(workQueue, { durable: false });

          // worker
          channel.consume(
            workQueue,
            function(msg) {
              message = msg;

              // delete queue
              channel.deleteQueue(
                workQueue,
                {
                  ifUnused: false,
                  ifEmpty: false
                },
                err2 => {
                  if (err2) {
                    Logger.error(`could not delete queue '${workQueue}'`);
                  }
                  // close channel
                  channel.close();
                }
              );

              // done before test
              done();
            },
            {
              noAck: true
            }
          );

          // send to a worker
          channel.sendToQueue(
            workQueue,
            Buffer.from(JSON.stringify(messageContent))
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

  describe("Promise API", () => {
    var message;
    var messageContent = { data: "Data for a worker (Promise API)" };

    // create sender and worker channels
    before(done => {

      var workQueue = `test_worker_${generateId()}`;

      function createPublisher() {
        Tester.open.then(conn => {
          return conn.createChannel();
        })
        .then(ch => {
          return ch.assertQueue(workQueue, { durable: false }).then(function() {
            var v = ch.sendToQueue(
              workQueue,
              Buffer.from(JSON.stringify(messageContent))
            );
      
            ch.close()
              .catch(() => {
                Logger.warn(`could not delete channel`);
              });
      
            return v;
          });
        })
        .catch(done);
      };

      function createConsumer() {
        Tester.open.then(conn => {
          return conn.createChannel();
        })
        .then(ch => {
          return ch.assertQueue(workQueue, { durable: false }).then(function() {
            var v = ch.consume(workQueue, function(msg) {
              message = msg;
              ch.ack(msg);
              
              return ch.deleteQueue(
                workQueue,
                {
                  ifUnused: false,
                  ifEmpty: false
                }).then(() => {
                  return ch.close();
                })
                .then(() => done())
                .catch(() => {
                  Logger.error(`could not delete queue '${workQueue}'`);
                  done();
                });
            });
      
            createPublisher();
      
            return v;
          });
        })
        .catch(done);
      };

      createConsumer();
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
});
