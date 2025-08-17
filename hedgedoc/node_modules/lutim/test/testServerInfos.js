const lutim = require("../lib/lutim");
const expect = require("chai").expect;
const nock = require("nock");
const serverResponse = require("./response/getServerInfoResponse");

describe("Get Server Infos", function() {
  beforeEach(() => {
    nock("http://url.com")
      .get("/infos/")
      .reply(200, serverResponse);
    lutim.setAPIUrl("http://url.com/");
  });

  it("should pass with mocked response", () => {
    return lutim.getServerInfos().then(res => {
      expect(res).instanceOf(Object);
      expect(res.contact).equal(serverResponse.contact);
    });
  });
});
