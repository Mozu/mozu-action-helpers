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

EntityInstaller.prototype.upsertList = function(list) {
  var me = this;
    return me.client.createEntityList(list).catch( 
    function(e) {
        return me.client.updateEntityList(list);
    });
};


EntityInstaller.prototype.enableEntitiesForTenant = function() {
	var client = entityClientFactory(this.client);
	me.updateListNamespace(list, context);
	return client.getEntity(settingsDocumentConfig).then(function(settings) {
		settings.entityManagerVisible = true;
		return client.updateEntity(settingsDocumentConfig, {
			body: settings
		});
	});
};