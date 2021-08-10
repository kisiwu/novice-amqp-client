const bluebird = require('bluebird');
const AMQClient = require('../../index');

describe('Connection with predefined headers', function() {
  const { params, logger, tester } = this.ctx.kaukau;

  describe('Callback API', () => {
    before((done) => {
      let amqClient = new AMQClient(
        params('amqp'),
        null,
        // predefined headers for all messages sent (e.g.: {port: 80})
        params('defaultHeaders')
      );

      // connect
      amqClient.connect((err, conn) => {
        tester.connection = conn;
        done(err);
      });
    });

    it('should be connected', function (done) {
      expect(tester.connection).to.have.property('connection');
      done();
    });
  });

  describe('Promise API', () => {
    before((done) => {
      let amqClient = new AMQClient(
        params('amqp'),
        null,
        // predefined headers for all messages sent (e.g.: {port: 80})
        params('defaultHeaders')
      );

      // connect
      tester.open = amqClient.connect();
      done();
    });

    it('should be connected', function (done) {
      expect(tester.open).to.be.an.instanceof(bluebird);
      done();
    });
  });
});
