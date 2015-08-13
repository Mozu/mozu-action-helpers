var getAppInfo = require('../get-app-info');
var assert = require('assert');

describe('the getAppInfo function', function() {
  it("returns metadata about the application", function() {
    var k = getAppInfo({
      apiContext: {
        appKey: "abc123.exampleapp.1.0.2"
      }
    });
    assert.equal(k.namespace,"abc123");
    assert.equal(k.id,"exampleapp");
    assert.equal(k.version,"1.0.2");
  });
});