const lutim = require("../lib/lutim");
var expect = require("chai").expect;
const nock = require("nock");

describe("Upload Image", function() {
  it("should fail without parameters", () => {
    lutim
      .uploadImage()
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });
});
