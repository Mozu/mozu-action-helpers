var assert = require('assert');
var enableDestroy = require('server-destroy');
var extensionGet1 = require('./testData/extensions1.json');
//var SDK = require('mozu-node-sdk');

describe('Mozu Hosted Calls', function() {

    var tenantPod;
    var homePod;

   //var blankResponse = JSON.stringify({ items: [] });

    before(function(done) {
        var http = require('http');
        tenantPod = http.createServer(function(request, response) {
            response.writeHead(200, {
                "Content-Type": "text/json"
            });
            console.log( request.path);
            response.end(JSON.stringify(extensionGet1));
        });
        tenantPod.listen(1789);
        homePod = http.createServer(function(request, response) {
            response.writeHead(403, {
                "Content-Type": "text/json"
            });
            response.end(JSON.stringify({
                message: 'Should not call home pod in mozuHosted environment with request: ' + request.url
            }));
        });
        homePod.listen(1456);
        enableDestroy(tenantPod);
        enableDestroy(homePod);
        done();
    });

    after(function(done) {
        homePod.destroy(function() {
            tenantPod.destroy(done);
        });
       
        process.env.mozuHosted = '';
    });

    this.timeout(20000);


    it('provide a readymade SDK client whose context can be hand-modified', function(done) {

        var 
            headersConstants = require('mozu-node-sdk/src/constants').headers,
            sdkConfig = {
                baseUrl: "http://localhost:1456/",
                tenantPod: "http://localhost:1789/",
            };
        sdkConfig[headersConstants.SITE] = 123;
        sdkConfig[headersConstants.USERCLAIMS] = "fonzie";

        process.env.mozuHosted = JSON.stringify({
            sdkConfig: sdkConfig
        });

        var oppParams = require('./utils/apiOperationConetxt').operation1();
        var entitlementInstaller = require('../src/installers/extensions').installer();

       
        entitlementInstaller.enableExtensions(oppParams.context)
            .then(function(){
                done();
            })
            .catch(done);
       
    });
});
