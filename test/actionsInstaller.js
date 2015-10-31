/* global describe: true, before:true, after:true , it:true*/
var findWhere = require('lodash.findwhere');
var assert = require('assert');
var enableDestroy = require('server-destroy');
var actionGet1 = require('./testData/actions1.json');
var bodyParser = require('body-parser');

var express = require('express');
var tenantPodServer;
var verifyPayload;
var existingActions = actionGet1;
var headersConstants = require('mozu-node-sdk/constants').headers;

function addLocalConfig(context) {
  context = context || {};
  context.baseUrl = "http://localhost:1456/",
  context.tenantPod = "http://localhost:1789/",
  context[headersConstants.TENANT] = 345;
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
    process.env.mozuHosted = true;
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

  it('installs global custom configuration', function() {

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
      var confs = req.body.configurations;
      assert.ok(confs, 'configurations present');
      assert.ok(confs[0], 'one configuration present');
      assert.equal(confs[0].applicationKey, appKey);
      assert.deepEqual(confs[0].configuration,
        testGlobalConf, 'global configuration not passed');
    }

    return entitlementInstaller.enableActions(oppParams.context, function() {
      return testGlobalConf;
    });
  });

  it('installs per-function custom configuration', function() {

    var testBeforeInstallConf =  {
      'test': 'faile',
      's e r i a l i z e s': ['poorly'],
      nullExists: false
    };

    var testBeforeRequestConf =  {
      'test': 'result',
      's e r i a l i z e s': ['penguin'],
      nullExists: true
    };

    var oppParams = require('./utils/apiOperationContext').operation1();
    oppParams.context.apiContext = addLocalConfig(oppParams.context.apiContext);
    var entitlementInstaller = require('../installers/actions')(oppParams.context);
    var appKey = oppParams.context.get.applicationKey();

    verifyPayload = function(req, res) {
      var beforeInstallAction = findWhere(req.body.actions, {
        actionId: 'api.platform.applications.install'
      });
      assert.ok(beforeInstallAction, 'beforeInstallAction exists');
      assert.ok(beforeInstallAction.contexts[0], 'one context exists');
      assert.ok(beforeInstallAction.contexts[0].customFunctions[0],
               'one custom function config exists');
      assert.deepEqual(
        beforeInstallAction.contexts[0].customFunctions[0].configuration,
        testBeforeInstallConf,
        'configuration exists on function config'
      );
      var beforeRequestAction = findWhere(req.body.actions, {
        actionId: 'storefront.pages.global.beforeRequest'
      });
      assert.ok(beforeRequestAction, 'beforeInstallAction exists');
      assert.ok(beforeRequestAction.contexts[0], 'one context exists');
      assert.ok(beforeRequestAction.contexts[0].customFunctions[0],
               'one custom function config exists');
      assert.deepEqual(
        beforeRequestAction.contexts[0].customFunctions[0].configuration,
        testBeforeRequestConf,
        'configuration exists on function config'
      );
    }

    return entitlementInstaller.enableActions(oppParams.context, null,
      {
        'api.platform.applications.install': function() {
          return testBeforeInstallConf;
        },
        'storefront.page.beforeRequest': function() {
          return testBeforeRequestConf;
        }
      }
    );
  })

});
