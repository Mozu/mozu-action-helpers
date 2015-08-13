/**
 * So far all this does is parse app key and return it, 
 * but one day it might do more.
 */

var parseAppKey = require('./parse-app-key');

module.exports = function(context) {
  return parseAppKey(context.apiConfig.appKey);
};