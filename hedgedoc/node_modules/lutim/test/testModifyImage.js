const lutim = require("../lib/lutim");
const expect = require("chai").expect;
const nock = require("nock");
const serverResponse = require("./response/modifyImageResponse");
const serverNotFoundResponse = require("./response/modifyImageNotFoundResponse");

describe("Modify image", function() {
  beforeEach(() => {
    nock("http://url.com")
      .post("/m/rJB4kl45/o0wbZGu1PbjifG076GjbTLMf")
      .reply(200, serverResponse);

    nock("http://url.com")
      .post("/m/not/existant")
      .reply(404, serverNotFoundResponse);

    lutim.setAPIUrl("http://url.com/");
  });

  it("should pass with mocked response", () => {
    return lutim
      .modifyImage("rJB4kl45", "o0wbZGu1PbjifG076GjbTLMf", 0, 0)
      .then(res => {
        expect(res).instanceOf(Object);
        expect(res.success).equal(true);
      });
  });

  it("should pass without firstView parameter", () => {
    return lutim
      .deleteImage("rJB4kl45", "o0wbZGu1PbjifG076GjbTLMf", 0)
      .then(res => {
        expect(res).instanceOf(Object);
        expect(res.success).equal(true);
      });
  });

  it("should not be able to modify a not found image", () => {
    return lutim.modifyImage("not", "existant", 0, 0).then(res => {
      expect(res).instanceOf(Object);
      expect(res.success).equal(false);
    });
  });

  it("should not pass without parameters", () => {
    return lutim
      .modifyImage()
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });

  it("should not pass without realShort", () => {
    return lutim
      .modifyImage(null, "token", "deleteDay")
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });

  it("should not pass without token", () => {
    return lutim
      .modifyImage("realShort", null, "deleteDay")
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });

  it("should not pass without deleteDay", () => {
    return lutim
      .modifyImage("realShort", "deleteDay", null)
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });
});
