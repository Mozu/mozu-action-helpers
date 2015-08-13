var parseAppKey = require('../parse-app-key');
var assert = require('assert');

describe('the parseAppKey function', function() {
  it("parses application keys into objects", function() {
    var k = parseAppKey("abc123.exampleapp.1.0.2");
    assert.equal(k.namespace,"abc123");
    assert.equal(k.id,"exampleapp");
    assert.equal(k.version,"1.0.2");
  });
});