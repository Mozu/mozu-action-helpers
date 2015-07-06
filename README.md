# mozu-action-helpers

Helpers to assist with the development of Mozu Code Actions

## This package is currently a prerelease.
**This contains pre-release code. It may have behaviors or rely on features that don't work in Mozu production environments. Use with caution!**

## Features

The `installers` provide convenient wrappers for common CMS, platform, and entity tasks that code action authors will find themselves frequently doing. Each one is basically a thin layer around a [Mozu Node SDK](https://github.com/mozu/mozu-node-sdk) instance, so you must pass an API context to the constructors. In a Code Action, that API context will be provided by the `context` object.

#### Actions
This module contains methods for adding your action to the enabled actions configuration for a tenant. It is meant to be used in a custom function for the `embedded.platform.applications.install` action, and its `enableActions` method accepts the context from that action.

```js
var ActionInstaller = require('mozu-action-helpers/installers/actions')();

var actionInstaller = new ActionInstaller(context.apiContext);

actionInstaller.enableActions(context).then(callback.bind(null, null), callback);

};
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
