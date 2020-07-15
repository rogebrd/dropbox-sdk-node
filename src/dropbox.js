import { routes } from '../lib/routes';
import { routes as teamRoutes } from '../lib/routes-team';

/**
 * @class Dropbox
 * @classdesc The Dropbox SDK class that provides methods to read, write and
 * create files or folders in a user or team's Dropbox.
 * @arg {Object} options
 * @arg {Function} [options.fetch] - fetch library for making requests.
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

    if (!options.fetch) { console.warn('Global fetch is deprecated and will be unsupported in a future version. Please pass fetch function as option when instantiating dropbox instance: new Dropbox({fetch})'); } // eslint-disable-line no-console

    this.accessToken = options.accessToken;
    this.accessTokenExpiresAt = options.accessTokenExpiresAt;
    this.refreshToken = options.refreshToken;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.selectUser = options.selectUser;
    this.selectAdmin = options.selectAdmin;
    this.fetch = options.fetch || fetch;
    this.pathRoot = options.pathRoot;

    Object.assign(this, routes);
    Object.assign(this, teamRoutes);
  }

  // What about sharing route that was defined here?

  request(path, args, auth, host, style) {
    let request = null;
    switch (style) {
      case RPC:
        request = this.getRpcRequest();
        break;
      case DOWNLOAD:
        request = this.getDownloadRequest();
        break;
      case UPLOAD:
        request = this.getUploadRequest();
        break;
      default:
        throw new Error(`Invalid request style: ${style}`);
    }
    const options = {
      selectUser: this.selectUser,
      selectAdmin: this.selectAdmin,
      clientId: this.getClientId(),
      clientSecret: this.getClientSecret(),
      pathRoot: this.pathRoot,
    };
    return request(path, args, auth, host, this, options);
  }
}