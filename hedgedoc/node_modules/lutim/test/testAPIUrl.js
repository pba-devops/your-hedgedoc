var lutim = require("../lib/lutim");
var expect = require("chai").expect;

describe("APIUrl", () => {
  it("should return default API url", () => {
    var defaultApi = "https://framapic.org/";
    expect(lutim.getAPIUrl()).to.be.equal(defaultApi);
  });

  it("shoud return the url that was set", () => {
    var newApi = "http://localhost:8181/";
    lutim.setAPIUrl(newApi);
    expect(lutim.getAPIUrl()).to.be.equal(newApi);
  });

  it("shoud return the url that was set with / at the end", () => {
    var newApi = "http://localhost:8181";
    lutim.setAPIUrl(newApi);
    expect(lutim.getAPIUrl()).to.be.equal(newApi + "/");
  });
});
