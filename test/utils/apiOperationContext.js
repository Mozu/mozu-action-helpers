var context = {
    apiContext: {
      applicationKey: 'asdfsadf'
    },
    get: {

        installationState: function() {
            return {};
        },
        nameSpace: function() {
            return 'scoobie';
        },
        exports: function() {
            return [{
                "id": "api.commerce.carts.embedded.beforeAddItem",
                "virtualPath": "./dist\\app.js",
                "actionId": "api.commerce.carts.embedded.beforeAddItem"
            }, {
                "id": "api.platform.applications.install",
                "virtualPath": "./dist\\app.js",
                "actionId": "api.platform.applications.install"
            }, {
                "id": "api.platform.applications.uninstall",
                "virtualPath": "./dist\\app.js",
                "actionId": "api.platform.applications.uninstall"
            }, {
                "id": "storefront.page.beforeRequest",
                "virtualPath": "./dist\\app.js",
                "actionId": "storefront.pages.global.beforeRequest"
            },  {
                "id": "api.commerce.catalog.storefront.shipping.filter.afterRequestRates",
                "virtualPath": "./dist\\app.js",
                "actionId": "api.commerce.catalog.storefront.shipping.filter.afterRequestRates"
            }];
        },
        applicationKey: function() {
            return "bing.bong.1.0.1.Release";
        }

    },
    exec: {

        saveInstallationState: function() {

        }

    }
};

var callback = function(e) {
    if (e) {
        console.log(e);

    }


};


module.exports = {
    operation1: function() {
        return {
            context: context,
            callback: callback
        };
    }
};
