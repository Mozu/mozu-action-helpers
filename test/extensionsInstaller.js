/* global describe: true, before:true, after:true , it:true*/
var assert = require('assert');
var enableDestroy = require('server-destroy');
var extensionGet1 = require('./testData/extensions1.json');
var bodyParser = require('body-parser');

var express = require('express');
//var SDK = require('mozu-node-sdk');
var tenantPodServer;

describe('Mozu Hosted Calls', function() {

  before(function(done) {
    var tenantPod = express();

    var jsonParser = bodyParser.json();
    tenantPod.use(jsonParser);

    tenantPod.get('/api/platform/extensions/', function(req, res) {
      res.send(extensionGet1);
    });
    tenantPod.put('/api/platform/extensions/', function(req, res) {
      console.log(req.path);
      assert.ok(JSON.stringify(req.body).indexOf('beforeRequestRates') > -1, 'contains beforeRequestRates');
      res.send({});
    });

    tenantPodServer = tenantPod.listen(1789, function() {
      done();
    });
    enableDestroy(tenantPodServer);

  });

  after(function(done) {
    tenantPodServer.destroy(done);

    process.env.mozuHosted = '';
  });



  it('installs all extensions in scope', function(done) {

    var headersConstants = require('mozu-node-sdk/constants').headers,
      sdkConfig = {
        baseUrl: "http://localhost:1456/",
        tenantPod: "http://localhost:1789/",
      };
    sdkConfig[headersConstants.SITE] = 123;
    sdkConfig[headersConstants.USERCLAIMS] = "fonzie";

    process.env.mozuHosted = JSON.stringify({
      sdkConfig: sdkConfig
    });

    var oppParams = require('./utils/apiOperationContext').operation1();
    var entitlementInstaller = require('../installers/extensions')();


    entitlementInstaller.enableExtensions(oppParams.context)
      .then(function() {
        done();
      })
      .catch(done);

  });
});