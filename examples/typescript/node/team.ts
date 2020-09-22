import Dropbox = require('../../../');
const prompt = require('prompt');

prompt.start();

prompt.get({
  properties: {
    accessToken: {
      description: 'Please enter an API V2 team access token'
    }
  }
}, function (error: any, result: any) {
  var dbx = new Dropbox.Dropbox({ accessToken: result.accessToken });
  dbx.teamDevicesListTeamDevices({})
    .then(function (response) {
      console.log('Devices', response);
    })
    .catch(function (err: Dropbox.Error<Dropbox.team.ListTeamDevicesError>) {
      console.log(err);
    });
});
