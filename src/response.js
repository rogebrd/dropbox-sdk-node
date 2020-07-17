export class DropboxResponse {
  constructor(status, headers, result) {
    this.status = status;
    this.headers = headers;
    this.result = result;
  }
}

export function parseRpcResponse(res) {
  const clone = res.clone();

  return res.json()
    .catch(() => {
      clone.text();
    })
    .then((data) => new DropboxResponse(res.status, res.headers, data));
}

export function parseDownloadResponse(res) {
  let data;

  if (!res.ok) {
    data = res.text();
  } else {
    data = res.buffer();
  }

  const result = JSON.parse(res.headers.get('dropbox-api-result'));
  result.fileBinary = data;

  return new DropboxResponse(res.status, res.headers, result);
}
