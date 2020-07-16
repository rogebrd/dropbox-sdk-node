import { getBaseURL, httpHeaderSafeJson } from './utils';

function parseBodyToType(res) {
  const clone = res.clone();
  return new Promise((resolve) => {
    res.json()
      .then((data) => resolve(data))
      .catch(() => clone.text().then((data) => resolve(data)));
  })
    .then((data) => [res, data]);
}

function getDataFromConsumer(res) {
  if (!res.ok) {
    return res.text();
  }

  return res.buffer();
}

function responseHandler(res, data) {
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
}

export function downloadRequest(fetch) {
  return function downloadRequestWithFetch(path, args, auth, host, client, options) {
    return client.checkAndRefreshAccessToken()
      .then(() => {
        if (auth !== 'user') {
          throw new Error(`Unexpected auth type: ${auth}`);
        }

        const fetchOptions = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client.getAccessToken()}`,
            'Dropbox-API-Arg': httpHeaderSafeJson(args),
          },
        };

        if (options) {
          if (options.selectUser) {
            fetchOptions.headers['Dropbox-API-Select-User'] = options.selectUser;
          }
          if (options.selectAdmin) {
            fetchOptions.headers['Dropbox-API-Select-Admin'] = options.selectAdmin;
          }
          if (options.pathRoot) {
            fetchOptions.headers['Dropbox-API-Path-Root'] = options.pathRoot;
          }
        }

        return fetchOptions;
      })
      .then((fetchOptions) => fetch(getBaseURL(host) + path, fetchOptions))
      .then((res) => getDataFromConsumer(res).then((data) => [res, data]))
      .then(([res, data]) => responseHandler(res, data));
  };
}

export function uploadRequest(fetch) {
  return function uploadRequestWithFetch(path, args, auth, host, client, options) {
    return client.checkAndRefreshAccessToken()
      .then(() => {
        if (auth !== 'user') {
          throw new Error(`Unexpected auth type: ${auth}`);
        }

        const { contents } = args;
        delete args.contents;

        const fetchOptions = {
          body: contents,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client.getAccessToken()}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': httpHeaderSafeJson(args),
          },
        };

        if (options) {
          if (options.selectUser) {
            fetchOptions.headers['Dropbox-API-Select-User'] = options.selectUser;
          }
          if (options.selectAdmin) {
            fetchOptions.headers['Dropbox-API-Select-Admin'] = options.selectAdmin;
          }
          if (options.pathRoot) {
            fetchOptions.headers['Dropbox-API-Path-Root'] = options.pathRoot;
          }
        }

        return fetchOptions;
      })
      .then((fetchOptions) => fetch(getBaseURL(host) + path, fetchOptions))
      .then((res) => parseBodyToType(res))
      .then(([res, data]) => {
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
  };
}

export function rpcRequest(fetch) {
  return function rpcRequestWithFetch(path, body, auth, host, client, options) {
    return client.checkAndRefreshAccessToken()
      .then(() => {
        const fetchOptions = {
          method: 'POST',
          body: (body) ? JSON.stringify(body) : null,
        };
        const headers = {};
        if (body) {
          headers['Content-Type'] = 'application/json';
        }
        let authHeader = '';

        switch (auth) {
          case 'app':
            if (!options.clientId || !options.clientSecret) {
              throw new Error('A client id and secret is required for this function');
            }
            authHeader = Buffer.from(`${options.clientId}:${options.clientSecret}`).toString('base64');
            headers.Authorization = `Basic ${authHeader}`;
            break;
          case 'team':
          case 'user':
            headers.Authorization = `Bearer ${client.getAccessToken()}`;
            break;
          case 'noauth':
            break;
          default:
            throw new Error(`Unhandled auth type: ${auth}`);
        }

        if (options) {
          if (options.selectUser) {
            headers['Dropbox-API-Select-User'] = options.selectUser;
          }
          if (options.selectAdmin) {
            headers['Dropbox-API-Select-Admin'] = options.selectAdmin;
          }
          if (options.pathRoot) {
            headers['Dropbox-API-Path-Root'] = options.pathRoot;
          }
        }

        fetchOptions.headers = headers;
        return fetchOptions;
      })
      .then((fetchOptions) => fetch(getBaseURL(host) + path, fetchOptions))
      .then((res) => parseBodyToType(res))
      .then(([res, data]) => {
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
  };
}
