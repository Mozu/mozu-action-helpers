/* global describe: true, before:true, after:true , it:true*/
var assert = require('assert');
var findWhere = require('lodash.findwhere');
var assign = require('lodash.assign');
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

      assert.ok(JSON.stringify(req.body).indexOf('bing.bong.1.0.0.Release') === -1, 'contains bing.bong.1.0.0.Release  should have replaced with ver 1.0.1');
      
    };

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

    return entitlementInstaller.enableActions(oppParams.context,
      function() {
        return testGlobalConf;
    });
  });

  it('transforms per-function custom settings and configuration', function() {

    var testBeforeInstallSettings = {
      logLevel: 'DEBUG',
      configuration: {
        'test': 'faile',
        's e r i a l i z e s': ['poorly'],
        nullExists: false
      }
    }

    var testBeforeRequestSettings = {
      timeoutMilliseconds: 20000,
      configuration: {
        'test': 'result',
        's e r i a l i z e s': ['penguin'],
        nullExists: true
      }
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
        testBeforeInstallSettings.configuration,
        'configuration was set on function'
      );
      assert.equal(
        beforeInstallAction.contexts[0].customFunctions[0].logLevel,
        'DEBUG',
        'loglevel was set on function'
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
        testBeforeRequestSettings.configuration,
        'configuration was set on function'
      );
      assert.equal(
        beforeRequestAction.contexts[0].customFunctions[0].timeoutMilliseconds,
        20000,
        'timeoutMilliseconds was set on function'
      );
    }

    return entitlementInstaller.enableActions(oppParams.context, null,
      {
        'api.platform.applications.install': function(funcSettings) {
          return assign({}, funcSettings, testBeforeInstallSettings);
        },
        'storefront.page.beforeRequest': function(funcSettings) {
          return assign({}, funcSettings, testBeforeRequestSettings);
        }
      }
    );
  })

});
