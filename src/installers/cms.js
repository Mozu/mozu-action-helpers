function CmsInstaller() {
    this.client = require('mozu-node-sdk').client();
    this.client.context["user-claims"] = null;
}

CmsInstaller.installer = function() {
    return new CmsInstaller();
};

module.exports = CmsInstaller;

//get tenant from tenant service by using ctx.apiContext.tenantId;

CmsInstaller.prototype.updateListNamespace = function(list, context) {
    list.nameSpace = context.get.nameSpace();
    list.documentListTypeFQN = list.name + "@" + list.nameSpace;
};

CmsInstaller.prototype.upsertSiteList = function(list) {
	var me = this;
    return me.client.content().documentListType().createDocumentListType(list).catch( 
        function(e) {
            return me.client.content().documentListType().updateDocumentListType(list, {
                documentListTypeFQN: list.documentListTypeFQN
            });
        });
};
