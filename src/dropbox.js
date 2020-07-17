import fetch from 'node-fetch';

import {
  UPLOAD,
  DOWNLOAD,
  RPC,
  APP_AUTH,
  TEAM_AUTH,
  USER_AUTH,
  NO_AUTH,
} from './constants';
import { routes } from '../lib/routes';
import { DropboxAuth } from './auth';
import { getDataFromResponse, getBaseURL, httpHeaderSafeJson } from './utils';

/**
 * @class Dropbox
 * @classdesc The Dropbox SDK class that provides methods to read, write and
 * create files or folders in a user or team's Dropbox.
 * @arg {Object} options
 * @arg {String} [options.accessToken] - An access token for making authenticated
 * requests.
 * @arg {String} [options.clientId] - The client id for your app. Used to create
 * authentication URL.
 * @arg {String} [options.selectUser] - Select user is only used by DropboxTeam.
 * It specifies which user the team access token should be acting as.
 * @arg {String} [options.pathRoot] - root pass to access other namespaces
 * Use to access team folders for example
 * @arg {String} [options.refreshToken] - A refresh token for retrieving access tokens
 * @arg {Date} [options.AccessTokenExpiresAt] - Date of the current access token's
 * expiration (if available)
 */
export default class Dropbox {
  constructor(options) {
    options = options || {};

    this.auth = DropboxAuth(options);
    this.selectUser = options.selectUser;
    this.selectAdmin = options.selectAdmin;
    this.pathRoot = options.pathRoot;

    Object.assign(this, routes);
  }

  // TODO: What about sharing route that was defined here?

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
      .then((res) => {
        const data = getDataFromResponse(res);

        // maintaining existing API for error codes not equal to 200 range
        if (!res.ok) {
          // eslint-disable-next-line no-throw-literal
          throw {
            error: data,
            response: res,
            status: res.status,
          };
        }

        return data;
      });
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
      .then((res) => {
        let data;

        if (!res.ok) {
          data = res.text();
        } else {
          data = res.buffer();
        }

        if (!res.ok) {
          // eslint-disable-next-line no-throw-literal
          throw {
            error: data,
            response: res,
            status: res.status,
          };
        }

        const result = JSON.parse(res.headers.get('dropbox-api-result'));
        result.fileBinary = data;

        return result;
      });
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
      .then((res) => {
        const data = getDataFromResponse(res);

        // maintaining existing API for error codes not equal to 200 range
        if (!res.ok) {
          // eslint-disable-next-line no-throw-literal
          throw {
            error: data,
            response: res,
            status: res.status,
          };
        }

        return data;
      });
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
