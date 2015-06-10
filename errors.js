module.exports = function MozuError(msg, opts) {
  Error.call(this, msg);
  opts = opts || {};
  this.httpStatusCode = opts.httpStatusCode || -1;
  this.errorCode = opts.errorCode || -1;
  this.additionalData = opts.additionalData || {};
}