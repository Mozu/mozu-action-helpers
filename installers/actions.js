var assign = require('lodash.assign');
var findWhere = require('lodash.findwhere');
var tenantExtensionsClientFactory = require(
  'mozu-node-sdk/clients/platform/tenantExtensions');

function ActionInstaller(config) {
  if (!(this instanceof ActionInstaller)) {
    return new ActionInstaller(config);
  }
  this.client = new tenantExtensionsClientFactory(config);
  this.client.context["user-claims"] = null;
}

module.exports = ActionInstaller;

ActionInstaller.prototype.enableActions =
  function(context, globalConfigurator, configurators) {
  var me = this,
    extExports = context.get.exports(),
    applicationKey = context.get.applicationKey();

  return me.client.getExtensions().then(function(enabledActions) {

    enabledActions = assign({
      configurations: []
    }, enabledActions);

    //add all your actions... 
    extExports.forEach(function(extExport) {
      //dont add installers.. not really actions
      if (extExport.actionId.indexOf('embedded.platform.applications') !== 0) {
        me.addCustomFunction(
          enabledActions, 
          extExport.actionId, 
          extExport.id, 
          applicationKey,
          configurators && configurators[extExport.id]
        );
      }
    });

    var appConfiguration;
    if (globalConfigurator) {
      // add custom configurations at app level
      appConfiguration = findWhere(enabledActions.configurations, 
                                   { applicationKey: applicationKey });
      if (!appConfiguration) {
        appConfiguration = {
          applicationKey: applicationKey,
          configuration: globalConfigurator({})
        };
        enabledActions.configurations.push(appConfiguration);
      } else {
        appConfiguration.configuration = 
          globalConfigurator(appConfiguration.configuration);
      }
    }

    return me.save(enabledActions);
  });


};

ActionInstaller.prototype.addCustomFunction =
  function(enabledActions, actionId, functionId, applicationKey, configurator) {

  var customFunctions,
    action;

  enabledActions = enabledActions || {};
  //if empty doc add actions node
  if (!enabledActions.actions) {
    enabledActions.actions = [];
  }
  //check for missing action
  
  action = findWhere(enabledActions.actions, { actionId: actionId });
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
      customFunctions: []
    });
  }
  //todo allow more contexts...
  customFunctions = action.contexts[0].customFunctions;

  var idProps = {
    functionId: functionId,
    applicationKey: applicationKey
  };

  var matchingFunc = findWhere(customFunctions, idProps);

  if (!matchingFunc) {
    matchingFunc = idProps;
    customFunctions.push(idProps);
  }

  if (configurator) {
    matchingFunc.configuration = configurator(matchingFunc.configuration);
  }

};

ActionInstaller.prototype.save = function(enabledActions) {
  return this.client.updateExtensions(enabledActions);
};
