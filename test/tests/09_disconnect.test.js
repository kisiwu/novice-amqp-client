describe("Disconnect", function() {

  const { logger, tester } = this.ctx.kaukau;

  describe("Callback API", () => {
    it("should disconnect", function(done) {
      tester.connection.on("close", () => {
        done();
      });
      tester.connection.close();
    });
  });

  describe("Promise API", () => {
    it("should disconnect", function(done) {
      tester.open.then(function(conn) {
        // process.once('SIGINT', conn.close.bind(conn));
        conn.close();
        done();
      }).catch(done);
    });
  });
});
