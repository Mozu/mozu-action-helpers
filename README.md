# mozu-action-helpers

Helpers to assist with the development of Mozu Code Actions

## This package is currently a prerelease.
**This contains pre-release code. It may have behaviors or rely on features that don't work in Mozu production environments. Use with caution!**

## Features

### Utilities

This package contains several utility methods for common tasks inside actions.

#### parseAppKey

You may need to parse an application key. This function takes an application key as a string, and returns an object with `namespace`, `id`, and `version` properties.

```js
var parseAppKey = require('mozu-action-helpers/parse-app-key');
var d = parseAppKey('abc123.exampleapp.1.0.1');

assert(d.namespace === 'abc123');
assert(d.id === 'exampleapp');
assert(d.version === '1.0.0');
```

### getAppInfo

This function takes a `context` and returns relevant app metadata.

```js
var getAppInfo = require('mozu-action-helpers/get-app-info');
var info = getAppInfo(context);

assert(info.namespace === 'abc123');
assert(info.id === 'exampleapp');
assert(info.version === '1.0.0');
```

*(Currently this is very similar to `parseAppKey`, but it is meant to be more general; in the future it may return much more app information than just what is in the key.)*

### Installers

The `installers` provide convenient wrappers for common CMS, platform, and entity tasks that code action authors will find themselves frequently doing. Each one is basically a thin layer around a [Mozu Node SDK](https://github.com/mozu/mozu-node-sdk) instance, so you must pass an API context to the constructors. In a Code Action, that API context will be provided by the `context` object.

#### Actions
This module contains methods for adding your action to the enabled actions configuration for a tenant. It is meant to be used in a custom function for the `embedded.platform.applications.install` action, and its `enableActions` method accepts the context from that action.

```js
var ActionInstaller = require('mozu-action-helpers/installers/actions')();

var actionInstaller = new ActionInstaller(context.apiContext);

actionInstaller.enableActions(context).then(callback.bind(null, null), callback);

};
```

##### Modifying Settings and Adding Configuration

The `.enableActions` method takes two more optional arguments.

**Global Configuration**
The first is a function that can create or update a global app-level configuration object. The configuration object can have any key-value pairs; a business user will be able to update this in the Action Settings JSON editor, and your custom functions will receive this configurtion in the `context.configuration` object.

If you supply a configurator function as the second argument to `enableActions`, it will receive any existing configuration for this app as its argument. This way, you can update existing configurations if they need to change.

```js
actionsInstaller.enableActions(context, function(appConfig) {
  appConfig = appConfig || {};
  // let's say that in your new version, the `widget` config is an array now.
  appConfig.widgets = appConfig.widgets || [];
  if (appConfig.widget) {
    appConfig.widgets.push(appConfig.widget);
    delete appConfig.widget;
  }
  return appConfig;
}
```

**Per-Function Setting Transforms**
The second optional argument you can pass to `.enableActions` is an object of transform functions named after your custom functions. These transform functions are how you can modify Arc.js runtime settings for custom functions, like `logLevel` and `timeoutMilliseconds`, and also how you can provide individual configuration objects for each custom function, via the `configuration` property. Each property on the object should be named after one of your custom functions; its value is a function that will receive the existing settings.

```js
actionsInstaller.enableActions(context, null, {
  'http.storefront.pages.global.beforeRequest': function(settings) {
    settings.logLevel = 'DEBUG';
    return settings;
  },
  'customFunctionName2': function(settings) {
    settings.timeoutMilliseconds = 20000;
    settings.configuration = Object.assign({}, settings.configuration, {
      debugSomeExternalCall: true
    });
    return settings;
  }
}
```
#### CMS
This module contains methods for modifying documentList, and documentListType, and documentType definitions. See https://developer.mozu.com/resources/1.14/content.documentlisttypes

The `upsertSiteList` method performs an "upsert"; it will create the documentList if it doesn't exist, and update it if it does.

```js

var CmsInstaller = require('mozu-action-helpers/installers/cms');
// some json for the list type definition
var myListType = require('/cmsMetaData/myListType.json');

var cmsInstaller = new CmsInstaller(context.apiContext);

//update the namespaces to the current app 
cmsInstaller.updateListNamespace(myListType, context);
//update or add the list type
cmsInstaller.upsertSiteList(myListType).then(callback.bind(null, null), callback);
};
```

#### Entities
This module contains methods for modifying entityList definitions. See http://developer.mozu.com/resources/1.14/platform.entitylists

The `upsertList` method performs an "upsert"; it will create the entityList if it doesn't exist, and update it if it does.

```js

var EntityInstaller = require('mozu-action-helpers/installers/entities');

var myListType = require('/entityMetaData/myListType.json');

var entityInstaller = new EntityInstaller(context);

entityInstaller.upsertList(myListType).then(callback.bind(null, null), callback);

```

The `enableEntitiesForTenant` method will turn on the hidden setting that makes the "Content/Entity" menu option visible in the Settings menu in admin. It requires a tenantId in the client context (which it will automatically receive in the code action custom function, if you supply the `content.apiContext` as context) but needs no arguments.

```js
entityInstaller.enableEntitiesForTenant().then(function() {
    console.log('enabled!');
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) Volusion Inc. Licensed under the MIT license.
