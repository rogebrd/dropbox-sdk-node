import chai from 'chai';

import Dropbox from '../../src/index.js';
import { DropboxResponse } from '../../src/response.js';

describe('Dropbox', () => {
  const dbx = new Dropbox({ accessToken: process.env.DBX_ACCESS_TOKEN });

  describe('rpc', () => {
    it('rpc request is successful', (done) => {
      dbx.usersGetCurrentAccount()
        .then((resp) => {
          chai.assert.instanceOf(resp, DropboxResponse);
          chai.assert.isObject(resp.result);
          chai.assert.equal(resp.status, 200);
          done();
        })
        .catch(done);
    });
  });
});
