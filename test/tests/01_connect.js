var kaukau = require("kaukau");
var Parameters = kaukau.Parameters;
var Tester = kaukau.Tester;
var Logger = kaukau.Logger;
var bluebird = require('bluebird');

var NoviceAMQClient = require("../../index");

describe("Connection with predefined headers", () => {

  describe("Callback API", () => {
    before(done => {
      var amqClient = new NoviceAMQClient(
        Parameters("amqp"),
        null,
        // predefined headers for all messages sent (e.g.: {port: 80})
        Parameters("defaultHeaders")
      );
  
      // connect
      amqClient.connect((err, conn) => {
        Tester.connection = conn;
        done(err);
      });
  
    });
  
    it("should be connected", function(done) {
      expect(Tester.connection).to.have.property('connection');
      done();
    });
  });

  describe("Promise API", () => {
    before(done => {
      var amqClient = new NoviceAMQClient(
        Parameters("amqp"),
        null,
        // predefined headers for all messages sent (e.g.: {port: 80})
        Parameters("defaultHeaders")
      );
  
      // connect
      Tester.open = amqClient.connect();
      done();
    });
  
    it("should be connected", function(done) {
      expect(Tester.open).to.be.an.instanceof(bluebird);
      done();
    });
  });
});
