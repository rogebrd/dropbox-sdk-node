# :warning: This Repository is Archived.  Please refer to the official [Dropbox Javascript SDK][repo] for current versions. :warning:
## This SDK was originally created by [Brad Rogers](https://github.com/rogebrd) and [Andrew Lawson](https://github.com/aelawson) as a Dropbox Hackweek project.  It has since been merged into the official [Dropbox Javascript SDK][repo].  Please refer to that SDK for any issues, updates, and new features.


[![Logo][logo]][repo]

[![node-current](https://img.shields.io/node/v/dropbox)](https://www.npmjs.com/package/dropbox)
[![npm](https://img.shields.io/npm/v/dropbox)](https://www.npmjs.com/package/dropbox)
[![codecov](https://codecov.io/gh/dropbox/dropbox-sdk-js/branch/master/graph/badge.svg)](https://codecov.io/gh/dropbox/dropbox-sdk-js)

The offical Dropbox SDK for Javascript.

Documentation can be found on [GitHub Pages][documentation]

## Installation

Create an app via the [Developer Console][devconsole]

Install via [npm](https://www.npmjs.com/)

```
$ npm install --save dropbox
```

Install from source:

```
$ git clone https://github.com/dropbox/dropbox-sdk-js.git
$ cd dropbox-sdk-js
$ npm install
```

After installation, follow one of our [Examples][examples] or read the [Documentation][documentation].

You can also view our [OAuth guide][oauthguide].

## Examples

We provide [Examples][examples] to help get you started with a lot of the basic functionality in the SDK.  We provide most examples in both Javascript and Typescript with some having a Node equivalent.

- **OAuth**
    - Auth - [ [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/auth) ] - A simple auth example to get an access token and list the files in the root of your Dropbox account.
    - Simple Backend [ [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/simple-backend) ] - A simple example of a node backend doing a multi-step auth flow for Short Lived Tokens.
    - PKCE Backend [ [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/PKCE-backend) ] - A simple example of a node backend doing a multi-step auth flow using PKCE and Short Lived Tokens.

- **Other Examples**
    - Basic - [ [TS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/typescript/node), [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/basic) ] - A simple example that takes in a token and fetches files from your Dropbox account.
    - Download - [ [TS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/typescript/node), [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/download) ] - An example showing how to download a shared file.
    - Team As User - [ [TS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/typescript/node), [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/team-as-user) ] - An example showing how to act as a user.
    - Team - [ [TS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/typescript/node), [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/team) ] - An example showing how to use the team functionality and list team devices.
    - Upload [ [TS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/typescript/node), [JS](https://github.com/dropbox/dropbox-sdk-js/tree/master/examples/javascript/upload) ] - An example showing how to upload a file to Dropbox.

## Getting Help

If you find a bug, please see [CONTRIBUTING.md][contributing] for information on how to report it.

If you need help that is not specific to this SDK, please reach out to [Dropbox Support][support].

## License

This SDK is distributed under the MIT license, please see [LICENSE][license] for more information.

[logo]: https://cfl.dropboxstatic.com/static/images/sdk/javascript_banner.png
[repo]: https://github.com/dropbox/dropbox-sdk-js
[documentation]: https://dropbox.github.io/dropbox-sdk-js/
[examples]: https://github.com/dropbox/dropbox-sdk-js/tree/master/examples
[license]: https://github.com/dropbox/dropbox-sdk-js/blob/master/LICENSE
[contributing]: https://github.com/dropbox/dropbox-sdk-js/blob/master/CONTRIBUTING.md
[devconsole]: https://dropbox.com/developers/apps
[oauthguide]: https://www.dropbox.com/lp/developers/reference/oauth-guide
[support]: https://www.dropbox.com/developers/contact
