const lutim = require("../lib/lutim");
const expect = require("chai").expect;
const nock = require("nock");
const serverResponse = require("./response/deleteImageReponse");
const serverResponseNotFound = require("./response/deleteImageNotFoundResponse");

describe("Delete image", function() {
  beforeEach(() => {
    nock("http://url.com")
      .get("/d/rJB4kl45/o0wbZGu1PbjifG076GjbTLMf")
      .reply(200, serverResponse);
    nock("http://url.com")
      .get("/d/not/existant")
      .reply(404, serverResponseNotFound);
    lutim.setAPIUrl("http://url.com/");
  });

  it("should pass with mocked response", () => {
    return lutim
      .deleteImage("rJB4kl45", "o0wbZGu1PbjifG076GjbTLMf")
      .then(res => {
        expect(res).instanceOf(Object);
        expect(res.success).equal(true);
      });
  });

  it("should not be able to delete a not found image", () => {
    return lutim.deleteImage("not", "existant").then(res => {
      expect(res).instanceOf(Object);
      expect(res.success).equal(false);
    });
  });

  it("should not pass without parameters", () => {
    return lutim
      .deleteImage()
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });

  it("should not pass without realShort", () => {
    return lutim
      .deleteImage(null, "token")
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });

  it("should not pass without token", () => {
    return lutim
      .deleteImage("realshort", null)
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });
});
