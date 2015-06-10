var entityListClientFactory = require('mozu-node-sdk/clients/platform/entityList')

function EntityInstaller() {
    this.client = entityListClientFactory(config);
    this.client.context["user-claims"] = null;
}

module.exports = EntityInstaller;

EntityInstaller.prototype.upsertList = function(list) {
  var me = this;
    return me.client.createEntityList(list).catch( 
    function(e) {
        return me.client.updateEntityList(list);
    });
};