export class DropboxResponse {
  constructor(status, headers, result) {
    this.status = status;
    this.headers = headers;
    this.result = result;
  }
}

export function parseResponse(res) {
  const clone = res.clone();

  return res.json()
    .catch(() => {
      clone.text();
    })
    .then((data) => new DropboxResponse(res.status, res.headers, data));
}

export function parseDownloadResponse(res) {
  return new Promise((resolve) => {
    if (!res.ok) {
      res.text()
        .then((data) => resolve(data));
    }
    res.buffer()
      .then((data) => resolve(data));
  })
    .then((data) => {
      let result;

      if (!res.ok) {
        result = data;
      } else {
        result = JSON.parse(res.headers.get('dropbox-api-result'));
        result.fileBinary = data;
      }

      return new DropboxResponse(res.status, res.headers, result);
    });
}
