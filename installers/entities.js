var entityListClientFactory = require('mozu-node-sdk/clients/platform/entityList');
var entityClientFactory = require('mozu-node-sdk/clients/platform/entitylists/entity');
var getAppInfo = require('mozu-action-helpers/get-app-info');

var settingsDocumentConfig = {
    entityListFullName: 'tenantadminsettings@mozu',
    id: 'global'
};

function EntityInstaller(config) {
    this.client = entityListClientFactory(config);
    this.client.context["user-claims"] = null;
}

module.exports = EntityInstaller;

EntityInstaller.prototype.updateListNamespace = function (list, context) {
    var info = getAppInfo(context);
    
    for (var key in list) {
        if (list.hasOwnProperty(key) && typeof list[key] === 'string') {
            list[key] = list[key].replace(/\{namespace\}/ig, function () {
                var ns = info.namespace;
                console.log('entityList %s {namespace} token replaced with %s', list.name, ns);                
                return ns;
            });
        }
    }
};

function logMessage(method, msg) {
    return function (list) {
        console[method](msg, getListName(list));     
    }
}

function getListName(list) {
    return list.name + (list.nameSpace ? '@' + list.nameSpace : '');
}

EntityInstaller.prototype.upsertList = function (list, context) {
    context = context || this.client.context;
    var me = this;
    console.info('entityInstaller.upsertList called with list %j ', list);
    if (!list.entityListFullName) {
        var fullNameEx = 'entityList requires entityListFullName to be set, which is name + \'@\' + nameSpace'; 
        console.error(fullNameEx);
        throw fullNameEx;
    }
    this.updateListNamespace(list, context);
    return me.client.createEntityList(list)
     .then(logMessage('info', 'created entityList: %s'))
     .catch(function (e) {
        console.info('entityList already existed. calling update');
        return me.client.updateEntityList(list)
            .then(logMessage('info', 'updated entityList %s'), function (updateErr) {
            console.error('error updating list: %s with error %s', getListName(list), updateErr);
            throw updateErr;
        });
    });
};


EntityInstaller.prototype.enableEntitiesForTenant = function () {
    var client = entityClientFactory(this.client);
    return client.getEntity(settingsDocumentConfig).then(function (settings) {
        settings.entityManagerVisible = true;
        return client.updateEntity(settingsDocumentConfig, {
            body: settings
        });
    });
};