const lutim = require("../lib/lutim");
const expect = require("chai").expect;

describe("Request builder", () => {
  it("should not pass without any parameters", () => {
    lutim
      ._requestBuilder()
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });

  it("should not pass without operation", () => {
    lutim
      ._requestBuilder(null, "payload", { par: "rams" })
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });
});
