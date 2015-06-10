var tenantExtensionsClientFactory = require('mozu-node-sdk/clients/platform/tenantExtensions');

function ExtensionInstaller(config) {
  if (!(this instanceof ExtensionInstaller)) {
    return new ExtensionInstaller(config);
  }
  this.client = tenantExtensionsClientFactory(config);
  this.client.context["user-claims"] = null;
}

module.exports = ExtensionInstaller;

ExtensionInstaller.prototype.enableExtensions = function(context) {
  var me = this,
    extExports = context.get.exports(),
    applicationKey = context.get.applicationKey();

  return me.client.getExtensions().then(function(enabledExtensions) {
    enabledExtensions = enabledExtensions || {};
    //add all your actions... 
    extExports.forEach(function(extExport) {
      //dont add installers.. not really actions
      if (extExport.actionId.indexOf('embedded.platform.applications') !== 0) {
        me.addCustomFunction(enabledExtensions, extExport.actionId, extExport.id, applicationKey);
      }
    });

    return me.save(enabledExtensions);
  });


};

ExtensionInstaller.prototype.addCustomFunction = function(enabledExtensions, actionId, functionId, applicationKey) {

  var customFunctions,
    action;

  enabledExtensions = enabledExtensions || {};
  //if empty doc add actions node
  if (!enabledExtensions.actions) {
    enabledExtensions.actions = [];
  }
  //check for missing action
  action = enabledExtensions.actions.reduce(function(found, action) {
    return (action.actionId === actionId) ? action : found;
  }, false);
  if (!action) {
    action = {
      'actionId': actionId,
      'contexts': []
    };
    enabledExtensions.actions.push(action);
  }
  action.contexts = action.contexts || [];
  if (action.contexts.length === 0) {
    action.contexts.push({
      "customFunctions": []
    });
  }
  //todo allow more contexts...
  customFunctions = action.contexts[0].customFunctions;


  function matchesFuncToAdd(cFunc) {
    return cFunc.functionId === functionId && cFunc.applicationKey === applicationKey;
  }

  if (!customFunctions.some(matchesFuncToAdd)) {
    customFunctions.push({
      'functionId': functionId,
      'applicationKey': applicationKey
    });
  }

};

ExtensionInstaller.prototype.save = function(enabledExtensions) {
  return this.client.updateExtensions(enabledExtensions);
};