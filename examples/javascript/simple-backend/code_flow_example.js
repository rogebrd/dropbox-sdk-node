

// Standalone example to demonstrate codeflow.
// Start the server, hit localhost:3000 on the browser, and click through.
// On the server logs, you should have the auth code, as well as the token
// from exchanging it. This exchange is invisible to the app user

let fetch = require('isomorphic-fetch');
const app = require('express')();

const hostname = 'localhost';
const port = 3000;
// const https = require('https');

const config = {
  fetch,
  clientId: 'jg8wc1hfkvel6ql',
  clientSecret: 'f0i5w4e6mlbbme5',
};

const {Dropbox} = require('dropbox');

let dbx = new Dropbox(config);

const redirectUri = `http://${hostname}:${port}/auth`;
const authUrl = dbx.getAuthenticationUrl(redirectUri, null, 'code', 'offline', null, 'none', false);

app.get('/', (req, res) => {
  res.writeHead(302, { Location: authUrl });
  res.end();
});

app.get('/auth', (req, res) => {
  const {code} = req.query;
  console.log(`code:${  code}`);
  let options = {code,
    redirectUri, ...config};

  dbx.getAccessTokenFromCode(redirectUri, code)
    .then((token) => {
        console.log('Token Result:' + JSON.stringify(token));
        dbx.setRefreshToken(token.refreshToken);
        dbx.usersGetCurrentAccount()
          .then(function(response) {
            console.log('response', response)
          })
          .catch(function(error) {
            console.error(error);
          });
    })
    .catch((error) => {
        console.log(error);
    });
});

app.listen(port);
