const lutim = require("../lib/lutim");
const expect = require("chai").expect;
const nock = require("nock");
const serverResponse = require("./response/imageInfosResponse");
const serverResponseNotFound = require("./response/imageInfosNotFoundResponse");

describe("Get image infos", function() {
  beforeEach(() => {
    nock("http://url.com")
      .get("/about/image")
      .reply(200, serverResponse);
    nock("http://url.com")
      .get("/about/notexistant")
      .reply(404, serverResponseNotFound);
    lutim.setAPIUrl("http://url.com/");
  });

  it("should pass with mocked response", () => {
    return lutim.getImageInfos("image").then(res => {
      expect(res).instanceOf(Object);
      expect(res.success).equal(true);
    });
  });

  it("should not be able to delete a not found image", () => {
    return lutim.getImageInfos("notexistant").then(res => {
      expect(res).instanceOf(Object);
      expect(res.success).equal(false);
    });
  });

  it("should not pass without parameters", () => {
    return lutim
      .getImageInfos()
      .then(() => {
        Promise.reject(new Error("Expected method to reject"));
      })
      .catch(err => {
        expect(err).instanceOf(Error);
      });
  });
});
