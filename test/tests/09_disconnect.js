var kaukau = require("kaukau");
var Tester = kaukau.Tester;

describe("Disconnect", () => {

  describe("Callback API", () => {
    it("should disconnect", function(done) {
      Tester.connection.on("close", () => {
        done();
      });
      Tester.connection.close();
    });
  });

  describe("Promise API", () => {
    it("should disconnect", function(done) {
      Tester.open.then(function(conn) {
        // process.once('SIGINT', conn.close.bind(conn));
        conn.close();
        done();
      }).catch(done);
    });
  });
});
