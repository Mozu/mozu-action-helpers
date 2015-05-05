# mozu-extension-helpers

Helpers to assist witht the development of Mozu Extensions

## This package is currently a prerelease.
**This contains pre-release code. It may have behaviors or rely on features that don't work in Mozu production environments. Use with caution!**



## Features
#### Extensions
This module contains methods for adding your extension to the enabled extions config for a tenant.

```js
var extensionInstaller = require('mozu-extension-helpers/installers/extensions').installer();
    extensionInstaller.enableExtensions(context)
        .then(function() {
            callback();
        })
        .catch(callback);
};
```

#### CMSs
This module contains methods for modifiing content type, document list, and document list type, and document type definitions.
  - see https://developer.mozu.com/resources/1.14/content.documentlisttypes

```js

var cmsInstaller = require('mozu-extension-helpers/installers/cms').installer();
// some json for the list type definition
var myListType = require('/cmsMetaData/myListType.json')

//update the namespaces to the current app 
cmsInstaller.updateListNamespace(testListType, context);
//update or add the list type
cmsInstaller.upsertSiteList(testListType)
        .then(function() {
            callback();
        })
        .catch(callback);
};
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) Volusion Inc.. Licensed under the MIT license.
