var documentListTypeClientFactory = require('mozu-node-sdk/clients/content/documentListType');

function CmsInstaller(config) {
  if (!this instanceof CmsInstaller) {
    return new CmsInstaller(config);
  }
  this.client = documentListTypeClientFactory(config);
  this.client.context["user-claims"] = null;
}

module.exports = CmsInstaller;

CmsInstaller.prototype.updateListNamespace = function(list, context) {
  list.nameSpace = context.get.nameSpace();
  list.documentListTypeFQN = list.name + "@" + list.nameSpace;
  return list;
};

CmsInstaller.prototype.upsertSiteList = function(list, context) {
  var me = this;
  me.updateListNamespace(list, context);
  return me.client.createDocumentListType(list).catch(
    function() {
      return me.client.updateDocumentListType(list);
    });
};