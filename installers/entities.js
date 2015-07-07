var entityListClientFactory = require('mozu-node-sdk/clients/platform/entityList');
var entityClientFactory = require('mozu-node-sdk/clients/platform/entitylists/entity');

var settingsDocumentConfig = {
	entityListFullName: 'tenantadminsettings@mozu',
	id: 'global'
};

function EntityInstaller(config) {
    this.client = entityListClientFactory(config);
    this.client.context["user-claims"] = null;
}

module.exports = EntityInstaller;

EntityInstaller.prototype.updateListNamespace = function(list, context) {
	list.nameSpace = context.get.nameSpace();
	list.entityListFullName = list.name + "@" + list.nameSpace;
};

EntityInstaller.prototype.upsertList = function(list, context) {
  var me = this;
	this.updateListNamespace(list, context);
    return me.client.createEntityList(list).catch( 
    function(e) {
        return me.client.updateEntityList(list);
    });
};


EntityInstaller.prototype.enableEntitiesForTenant = function() {
	var client = entityClientFactory(this.client);
	return client.getEntity(settingsDocumentConfig).then(function(settings) {
		settings.entityManagerVisible = true;
		return client.updateEntity(settingsDocumentConfig, {
			body: settings
		});
	});
};