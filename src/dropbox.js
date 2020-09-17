
import {
  UPLOAD,
  DOWNLOAD,
  RPC,
  APP_AUTH,
  TEAM_AUTH,
  USER_AUTH,
  NO_AUTH,
} from './constants.js';
import { routes } from '../lib/routes.js';
import DropboxAuth from './auth.js';
import { getBaseURL, httpHeaderSafeJson } from './utils.js';
import { parseDownloadResponse, parseResponse } from './response.js';

let fetch;
try {
  fetch = require('node-fetch'); // eslint-disable-line global-require
} catch (Exception) {
  fetch = window.fetch;
}

/* eslint-disable */
// Polyfill object.assign for legacy browsers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign !== 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      var output;
      var index;
      var source;
      var nextKey;
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      output = Object(target);
      for (index = 1; index < arguments.length; index++) {
        source = arguments[index];
        if (source !== undefined && source !== null) {
          for (nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  }());
}

// Polyfill Array.includes for legacy browsers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}
/* eslint-enable */

/**
 * @class Dropbox
 * @classdesc The Dropbox SDK class that provides methods to read, write and
 * create files or folders in a user or team's Dropbox.
 * @arg {Object} options
 * @arg {String} [options.selectUser] - Select user is only used for team functionality.
 * It specifies which user the team access token should be acting as.
 * @arg {String} [options.pathRoot] - root path to access other namespaces
 * Use to access team folders for example
 * @arg {String} [options.selectAdmin] - Select admin is only used by team functionality.
 * It specifies which team admin the team access token should be acting as.
 * @arg {DropboxAuth} [options.auth] - The DropboxAuth object used to authenticate requests.
 * If this is set, the remaining parameters will be ignored.
 * @arg {String} [options.accessToken] - An access token for making authenticated
 * requests.
 * @arg {Date} [options.AccessTokenExpiresAt] - Date of the current access token's
 * expiration (if available)
 * @arg {String} [options.refreshToken] - A refresh token for retrieving access tokens
 * @arg {String} [options.clientId] - The client id for your app. Used to create
 * authentication URL.
 * @arg {String} [options.clientSecret] - The client secret for your app. Used to create
 * authentication URL and refresh access tokens.
 */
export default class Dropbox {
  constructor(options) {
    options = options || {};

    if (options.auth) {
      this.auth = options.auth;
    } else {
      this.auth = new DropboxAuth(options);
    }

    this.selectUser = options.selectUser;
    this.selectAdmin = options.selectAdmin;
    this.pathRoot = options.pathRoot;

    Object.assign(this, routes);
  }

  request(path, args, auth, host, style) {
    switch (style) {
      case RPC:
        return this.rpcRequest(path, args, auth, host);
      case DOWNLOAD:
        return this.downloadRequest(path, args, auth, host);
      case UPLOAD:
        return this.uploadRequest(path, args, auth, host);
      default:
        throw new Error(`Invalid request style: ${style}`);
    }
  }

  rpcRequest(path, body, auth, host) {
    return this.auth.checkAndRefreshAccessToken()
      .then(() => {
        const fetchOptions = {
          method: 'POST',
          body: (body) ? JSON.stringify(body) : null,
          headers: {},
        };

        if (body) {
          fetchOptions.headers['Content-Type'] = 'application/json';
        }

        let authHeader;
        switch (auth) {
          case APP_AUTH:
            if (!this.auth.clientId || !this.auth.clientSecret) {
              throw new Error('A client id and secret is required for this function');
            }
            authHeader = Buffer.from(`${this.auth.clientId}:${this.auth.clientSecret}`).toString('base64');
            fetchOptions.headers.Authorization = `Basic ${authHeader}`;
            break;
          case TEAM_AUTH:
          case USER_AUTH:
            fetchOptions.headers.Authorization = `Bearer ${this.auth.getAccessToken()}`;
            break;
          case NO_AUTH:
            break;
          default:
            throw new Error(`Unhandled auth type: ${auth}`);
        }

        this.setCommonHeaders(fetchOptions);
        return fetchOptions;
      })
      .then((fetchOptions) => fetch(getBaseURL(host) + path, fetchOptions))
      .then((res) => parseResponse(res));
  }

  downloadRequest(path, args, auth, host) {
    return this.auth.checkAndRefreshAccessToken()
      .then(() => {
        if (auth !== USER_AUTH) {
          throw new Error(`Unexpected auth type: ${auth}`);
        }

        const fetchOptions = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.auth.getAccessToken()}`,
            'Dropbox-API-Arg': httpHeaderSafeJson(args),
          },
        };

        this.setCommonHeaders(fetchOptions);

        return fetchOptions;
      })
      .then((fetchOptions) => fetch(getBaseURL(host) + path, fetchOptions))
      .then((res) => parseDownloadResponse(res));
  }

  uploadRequest(path, args, auth, host) {
    return this.auth.checkAndRefreshAccessToken()
      .then(() => {
        if (auth !== USER_AUTH) {
          throw new Error(`Unexpected auth type: ${auth}`);
        }

        const { contents } = args;
        delete args.contents;

        const fetchOptions = {
          body: contents,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.auth.getAccessToken()}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': httpHeaderSafeJson(args),
          },
        };

        this.setCommonHeaders(fetchOptions);

        return fetchOptions;
      })
      .then((fetchOptions) => fetch(getBaseURL(host) + path, fetchOptions))
      .then((res) => parseResponse(res));
  }

  setCommonHeaders(options) {
    if (this.selectUser) {
      options.headers['Dropbox-API-Select-User'] = this.selectUser;
    }
    if (this.selectAdmin) {
      options.headers['Dropbox-API-Select-Admin'] = this.selectAdmin;
    }
    if (this.pathRoot) {
      options.headers['Dropbox-API-Path-Root'] = this.pathRoot;
    }
  }
}
