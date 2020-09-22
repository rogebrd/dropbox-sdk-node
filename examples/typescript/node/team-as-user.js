Object.defineProperty(exports, "__esModule", { value: true });
const Dropbox = require("../../../");
const prompt = require('prompt');
prompt.start();
prompt.get({
    properties: {
        accessToken: {
            description: 'Please enter an API V2 team access token'
        },
        userId: {
            description: 'Please enter the id of the user you would like to act as'
        }
    }
}, function (error, result) {
    var dbx = new Dropbox.Dropbox({ accessToken: result.accessToken, selectUser: result.userId });
    dbx.filesListFolder({ path: '' })
        .then(function (response) {
        console.log(response);
    })
        .catch(function (err) {
        console.log(err);
    });
});
//# sourceMappingURL=team-as-user.js.map