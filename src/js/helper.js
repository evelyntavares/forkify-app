import { TIMEOUT_SECONDS, GET_OPERATION } from './config';

export const getJSON = async function (url) {
  try {
    const response = await Promise.race([fetch(url), timeout(TIMEOUT_SECONDS)]);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message} (${response.status})`);
    }
    return data;
  } catch (err) {
    throw err;
  }
};

export const makeRequest = async function (
  url,
  method = GET_OPERATION,
  uploadData = undefined
) {
  let request;
  let options;

  if (method === GET_OPERATION) {
    request = fetch(url);
  } else {
    options = {
      method: `${method}`,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(uploadData && { body: JSON.stringify(uploadData) }),
    };
    request = fetch(url, options);
  }

  try {
    const response = await Promise.race([request, timeout(TIMEOUT_SECONDS)]);

    if (response.status === 204) {
      return response;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message} (${response.status})`);
    }
    return data;
  } catch (err) {
    throw err;
  }
};

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
