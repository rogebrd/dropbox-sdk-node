Object.defineProperty(exports, "__esModule", { value: true });
const Dropbox = require("../../../");
const prompt = require('prompt');
prompt.start();
prompt.get({
    properties: {
        accessToken: {
            description: 'Please enter an API V2 team access token'
        }
    }
}, function (error, result) {
    var dbx = new Dropbox.Dropbox({ accessToken: result.accessToken });
    dbx.teamDevicesListTeamDevices({})
        .then(function (response) {
        console.log('Devices', response);
    })
        .catch(function (err) {
        console.log(err);
    });
});
//# sourceMappingURL=team.js.map