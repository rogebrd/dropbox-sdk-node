"use strict";
/**
 * This file does not exist to be executed, just compiled,
 * so that we can ensure that the definition files
 * only reference names that exist,
 * and to perform a basic sanity check that types are exported as intended.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Dropbox = require("../../types/dropbox-sdk");
var DropboxAuth = Dropbox.DropboxAuth;
// Check DropboxAuth Constructor and Methods
// Test default constructor
var dropboxAuth = new DropboxAuth();
// Test config constructor
dropboxAuth = new DropboxAuth({
  accessToken: "myToken",
  accessTokenExpiresAt: new Date(Date.now()),
  refreshToken: "myToken",
  clientId: "myClientId",
  clientSecret: "myClientSecret",
});
// Test getters/setters
dropboxAuth.setAccessToken("myToken");
dropboxAuth.getAccessToken();
dropboxAuth.setAccessTokenExpiresAt(new Date(Date.now()));
dropboxAuth.getAccessTokenExpiresAt();
dropboxAuth.setRefreshToken("myToken");
dropboxAuth.getRefreshToken();
dropboxAuth.setClientId("myClientId");
dropboxAuth.getClientId();
dropboxAuth.setClientSecret("myClientSecret");
// Test other methods
dropboxAuth.getAuthenticationUrl("myRedirect");
dropboxAuth.getAuthenticationUrl("myRedirect", "myState");
dropboxAuth.getAuthenticationUrl("myRedirect", "myState", "code");
dropboxAuth.getAccessTokenFromCode("myRedirect", "myCode");
dropboxAuth.checkAndRefreshAccessToken();
dropboxAuth.refreshAccessToken();
dropboxAuth.refreshAccessToken("files.metadata.read files.metadata.write");
// Check Dropbox Constructor or Methods
// Test config constructor
var dropbox = new Dropbox.Dropbox({
  auth: dropboxAuth,
  selectUser: "",
  selectAdmin: "",
  pathRoot: "",
});
dropbox.usersGetCurrentAccount();
