/* global describe: true, before:true, after:true , it:true*/
var assert = require('assert');
var enableDestroy = require('server-destroy');
var actionGet1 = require('./testData/actions1.json');
var bodyParser = require('body-parser');

var express = require('express');
//var SDK = require('mozu-node-sdk');
var tenantPodServer;
var verifyPayload;
var existingActions = actionGet1;
var headersConstants = require('mozu-node-sdk/constants').headers;

function addLocalConfig(context) {
  context = context || {};
  context.baseUrl = "http://localhost:1456/",
  context.tenantPod = "http://localhost:1789/",
  context[headersConstants.SITE] = 123;
  context[headersConstants.USERCLAIMS] = "fonzie";
  return context;
}

describe('Mozu Hosted Calls', function() {

  before(function(done) {
    var tenantPod = express();
    var jsonParser = bodyParser.json();
    tenantPod.use(jsonParser);
    tenantPod.get('/api/platform/extensions/', function(req, res) {
      res.send(existingActions);
    });
    tenantPod.put('/api/platform/extensions/', function(req, res) {
      verifyPayload(req, res);
      res.send({});
    });
    tenantPodServer = tenantPod.listen(1789, done);
    enableDestroy(tenantPodServer);
  });

  after(function(done) {
    tenantPodServer.destroy(done);
    process.env.mozuHosted = '';
  });

  it('installs all actions in scope', function() {

    var oppParams = require('./utils/apiOperationContext').operation1();
    oppParams.context.apiContext = addLocalConfig(oppParams.context.apiContext);
    var entitlementInstaller = require('../installers/actions')(oppParams.context);

    verifyPayload = function(req, res) {
      console.log(req.path);
      assert.ok(JSON.stringify(req.body).indexOf('beforeRequestRates') > -1, 'contains beforeRequestRates');
    }

    return entitlementInstaller.enableActions(oppParams.context);

  });

  it('installs custom configurations', function() {

    var testGlobalConf =  {
      'test': 'pass',
      's e r i a l i z e s': ['well'],
      nullExists: null
    };

    var oppParams = require('./utils/apiOperationContext').operation1();
    oppParams.context.apiContext = addLocalConfig(oppParams.context.apiContext);
    var entitlementInstaller = require('../installers/actions')(oppParams.context);
    var appKey = oppParams.context.get.applicationKey();

    verifyPayload = function(req, res) {
      var confs = conf;
      assert.ok(confs, 'configurations present');
      assert.ok(confs[0], 'one configuration present');
      assert.equal(confs[0].applicationKey, appKey);
      assert.deepEqual(confs[0].configuration,
        testGlobalConf, 'global configuration not passed');
      
    }

  })

});
