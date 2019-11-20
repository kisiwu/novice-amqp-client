var kaukau = require("kaukau");
var Parameters = kaukau.Parameters;
var Tester = kaukau.Tester;
var Logger = kaukau.Logger;

var NoviceAMQClient = require("../../index");

describe("Connection with predefined headers", () => {
  before(done => {
    var amqClient = new NoviceAMQClient(
      Parameters("amqp"),
      null,
      // predefined headers for all messages sent (e.g.: {port: 80})
      Parameters("defaultHeaders")
    );

    // connect
    amqClient.connect().then(conn => {
      Tester.connection = conn;
      done();
    }, done);

  });

  it("should be connected", function(done) {
    expect(Tester.connection).to.have.property('connection');
    done();
  });
});
