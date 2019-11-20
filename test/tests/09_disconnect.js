var kaukau = require("kaukau");
var Tester = kaukau.Tester;

describe("Disconnect", () => {
  it("should disconnect", function(done) {
    Tester.connection.on("close", () => {
      done();
    });
    Tester.connection.close();
  });
});
