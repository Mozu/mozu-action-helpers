var endash = require('../endash');
var assert = require('assert');

describe('the endash utility module', function() {
  it("has an assign function", function() {
    var originalObject = { a: 1, b: 2};
	var addedTo = endash.assign(originalObject, { b: 3, c: 4});
	assert.deepEqual(addedTo, { a: 1, b: 3, c: 4});
  });
  it("has a filter function", function() {
    var nums = [1,2,3,4,5,6,7,8];
	var isOdd = function(num) { return num % 2 !== 0; }
	var odds = endash.filter(nums, isOdd);
	assert.deepEqual(odds, [1,3,5,7]);
  });
});