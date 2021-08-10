const ip = require('ip');
const generateId = require('../generateId');

describe('Work queues', function() {
  const { params, logger, tester } = this.ctx.kaukau;

  describe('Callback API', () => {
    let message;
    let messageContent = { data: 'Data for a worker' };

    // create sender and worker channels
    before((done) => {
      let conn = tester.connection;

      conn.createChannel((err, channel) => {
        if (err) {
          logger.error(err);
          done(err);
        } else {
          let workQueue = `test_worker_${generateId()}`;
          channel.assertQueue(workQueue, { durable: false });

          // worker
          channel.consume(
            workQueue,
            function (msg) {
              message = msg;

              // delete queue
              channel.deleteQueue(
                workQueue,
                {
                  ifUnused: false,
                  ifEmpty: false,
                },
                (err2) => {
                  if (err2) {
                    logger.error(`could not delete queue '${workQueue}'`);
                  }
                  // close channel
                  channel.close();
                }
              );

              // done before test
              done();
            },
            {
              noAck: true,
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

    it("should have 'senderIP' header", function (done) {
      expect(message.properties.headers)
        .to.be.an('object')
        .that.has.property('senderIP', ip.address());
      done();
    });

    it('should have default headers', function (done) {
      let dh = params('defaultHeaders');
      expect(message.properties.headers)
        .to.be.an('object')
        .that.includes.all.keys(dh);

      // check each header value
      Object.keys(dh).forEach((k) =>
        expect(message.properties.headers).to.have.property(k, dh[k])
      );
      done();
    });

    it('should have message content', function (done) {
      let content = message.content;
      expect(content).to.be.an.instanceof(Buffer);
      content = JSON.parse(content.toString());
      expect(content).to.be.an('object').that.has.all.keys(messageContent);

      // check each value
      Object.keys(messageContent).forEach((k) =>
        expect(content).to.have.property(k, messageContent[k])
      );
      done();
    });
  });

  describe('Promise API', () => {
    let message;
    let messageContent = { data: 'Data for a worker (Promise API)' };

    // create sender and worker channels
    before((done) => {
      let workQueue = `test_worker_${generateId()}`;

      function createPublisher() {
        tester.open
          .then((conn) => {
            return conn.createChannel();
          })
          .then((ch) => {
            return ch
              .assertQueue(workQueue, { durable: false })
              .then(function () {
                let v = ch.sendToQueue(
                  workQueue,
                  Buffer.from(JSON.stringify(messageContent))
                );

                ch.close().catch(() => {
                  logger.warn(`could not delete channel`);
                });

                return v;
              });
          })
          .catch(done);
      }

      function createConsumer() {
        tester.open
          .then((conn) => {
            return conn.createChannel();
          })
          .then((ch) => {
            return ch
              .assertQueue(workQueue, { durable: false })
              .then(function () {
                let v = ch.consume(workQueue, function (msg) {
                  message = msg;
                  ch.ack(msg);

                  return ch
                    .deleteQueue(workQueue, {
                      ifUnused: false,
                      ifEmpty: false,
                    })
                    .then(() => {
                      return ch.close();
                    })
                    .then(() => done())
                    .catch(() => {
                      logger.error(`could not delete queue '${workQueue}'`);
                      done();
                    });
                });

                createPublisher();

                return v;
              });
          })
          .catch(done);
      }

      createConsumer();
    });

    it("should have 'senderIP' header", function (done) {
      expect(message.properties.headers)
        .to.be.an('object')
        .that.has.property('senderIP', ip.address());
      done();
    });

    it('should have default headers', function (done) {
      let dh = params('defaultHeaders');
      expect(message.properties.headers)
        .to.be.an('object')
        .that.includes.all.keys(dh);

      // check each header value
      Object.keys(dh).forEach((k) =>
        expect(message.properties.headers).to.have.property(k, dh[k])
      );
      done();
    });

    it('should have message content', function (done) {
      let content = message.content;
      expect(content).to.be.an.instanceof(Buffer);
      content = JSON.parse(content.toString());
      expect(content).to.be.an('object').that.has.all.keys(messageContent);

      // check each value
      Object.keys(messageContent).forEach((k) =>
        expect(content).to.have.property(k, messageContent[k])
      );
      done();
    });
  });
});
