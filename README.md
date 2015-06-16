# mozu-extension-helpers

Helpers to assist with the development of Mozu Extensions

## This package is currently a prerelease.
**This contains pre-release code. It may have behaviors or rely on features that don't work in Mozu production environments. Use with caution!**

## Features

#### Extensions
This module contains methods for adding your extension to the enabled extensions config for a tenant.

```js
var ExtensionInstaller = require('mozu-extension-helpers/installers/extensions')();

var extensionInstaller = new ExtensionInstaller();

extensionInstaller.enableExtensions(context).then(function() {
  callback();
}, callback);

};
```

#### CMS
This module contains methods for modifying documentList, and documentListType, and documentType definitions.
  - see https://developer.mozu.com/resources/1.14/content.documentlisttypes

```js

var CmsInstaller = require('mozu-extension-helpers/installers/cms');
// some json for the list type definition
var myListType = require('/cmsMetaData/myListType.json');

var cmsInstaller = new CmsInstaller();

//update the namespaces to the current app 
cmsInstaller.updateListNamespace(testListType, context);
//update or add the list type
cmsInstaller.upsertSiteList(testListType)
        .then(function() {
            callback();
        })
        .catch(function(e){
            callback(e);
        });
};
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) Volusion Inc. Licensed under the MIT license.
