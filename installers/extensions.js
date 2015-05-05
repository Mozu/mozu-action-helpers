var _ = require('underscore');

  function ExtensionInstaller() {
      this.client = require('mozu-node-sdk').client();
      this.client.context["user-claims"] = null;
  }
  ExtensionInstaller.installer = function() {
      return new ExtensionInstaller();
  };

  module.exports = ExtensionInstaller;

  ExtensionInstaller.prototype.enableExtensions = function(context) {
      var me = this,
          extExports = context.get.exports(),
          applicationKey = context.get.applicationKey();

    return me.client.platform().tenantExtensions().getExtensions().then(function (enabledExtensions) {
        enabledExtensions = enabledExtensions || {};
        //add all your actions... 
        _.each(extExports, function (extExport) {
            //dont add installers.. not really actions
            if (extExport.actionId.indexOf('api.platform.applications') !== 0) {
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
      action = _.find(enabledExtensions.actions, function(action) {
          return action.actionId === actionId;
      });
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

      //check for customFunction
      if (!_.some(customFunctions, function(cFunc) {
              return cFunc.functionId === functionId && cFunc.applicationKey === applicationKey;
          })) {
          customFunctions.push({
              'functionId': functionId,
              'applicationKey': applicationKey
          });

      }
      //alread existed .. callback

  };
  ExtensionInstaller.prototype.save = function(enabledExtensions) {
    return this.client.platform().tenantExtensions().updateExtensions(enabledExtensions);
  };
