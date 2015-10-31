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

##### Adding and Updating Configuration

Often, an Arc.js application would benefit from some runtime, merchant modifiable settings. Arc.js has the concept of "configurations" to suit this purpose. Configurations are arbitrary JSON objects of whatever key-value pairs might suit your application's needs. In the [Arc.js extensions API](http://developer.mozu.com/content/api/APIResources/platform/extensions/extensions.htm), there is both a top-level `configurations` array for global, app-level configurations, an an optional `configuration` property on each custom function definition. The `configuration` values can be modified by the merchant in the Action Settings menu, and they are available to custom functions at the `context.configuration` property. Using the `ActionInstaller`, you can preset global configuration or per-function local configuration. The `actionInstaller.enableActions` method from the above example can take two optional arguments: a function to set global configuration, and an object whose keys can be the IDs of individual custom functions, and whose values are functions which return configuration objects for their respective custom functions.

If there is existing configuration for any of these, then the configurator functions will receive the existing configuration as their only argument.

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
