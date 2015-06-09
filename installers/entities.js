function EntityInstaller() {
    this.client = require('mozu-node-sdk/clients/platform/entityList')();
    this.client.context["user-claims"] = null;
}

EntityInstaller.installer = function() {
    return new EntityInstaller();
};

module.exports = EntityInstaller;

EntityInstaller.prototype.upsertList = function(list) {
  var me = this;
    return me.client.createEntityList(list).catch( 
    function(e) {
        return me.client.updateEntityList(list);
    });
};