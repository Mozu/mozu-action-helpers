var tenantExtensionsClientFactory = require('mozu-node-sdk/clients/platform/tenantExtensions');

function ActionInstaller(config) {
  if (!(this instanceof ActionInstaller)) {
    return new ActionInstaller(config);
  }
  this.client = tenantExtensionsClientFactory(config);
  this.client.context["user-claims"] = null;
}

module.exports = ActionInstaller;

ActionInstaller.prototype.enableActions = function(context) {
  var me = this,
    extExports = context.get.exports(),
    applicationKey = context.get.applicationKey();

  return me.client.getExtensions().then(function(enabledActions) {
    enabledActions = enabledActions || {};
    //add all your actions... 
    extExports.forEach(function(extExport) {
      //dont add installers.. not really actions
      if (extExport.actionId.indexOf('embedded.platform.applications') !== 0) {
        me.addCustomFunction(enabledActions, extExport.actionId, extExport.id, applicationKey);
      }
    });

    return me.save(enabledActions);
  });


};

ActionInstaller.prototype.addCustomFunction = function(enabledActions, actionId, functionId, applicationKey) {

  var customFunctions,
    action;

  enabledActions = enabledActions || {};
  //if empty doc add actions node
  if (!enabledActions.actions) {
    enabledActions.actions = [];
  }
  //check for missing action
  action = enabledActions.actions.reduce(function(found, action) {
    return (action.actionId === actionId) ? action : found;
  }, false);
  if (!action) {
    action = {
      'actionId': actionId,
      'contexts': []
    };
    enabledActions.actions.push(action);
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

ActionInstaller.prototype.save = function(enabledActions) {
  return this.client.updateExtensions(enabledActions);
};