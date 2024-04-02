const _ = require('lodash')
const aws4 = require('aws4')
const { URL } = require('url')
const http = require('axios')

const mode = process.env.TEST_MODE

const APP_ROOT = '../../'

const viaHandler = async (event, functionName) => {
  const handler = require(`${APP_ROOT}/functions/${functionName}`).handler

  const context = {}
  const response = await handler(event, context)
  const contentType = _.get(response, 'headers.content-type', 'application/json');
  if (response.body && contentType === 'application/json') {
    response.body = JSON.parse(response.body);
  }
  return response
}

const respondFrom = async (httpRes) => ({
  statusCode: httpRes.status,
  body: httpRes.data,
  headers: httpRes.headers
})

const signHttpRequest = (url) => {
  const urlData = new URL(url)
  const opts = {
    host: urlData.hostname,
    path: urlData.pathname
  }

  aws4.sign(opts)
  return opts.headers;
}

const viaHttp = async (relPath, method, opts) => {
  const url = `${process.env.rest_api_url}/${relPath}`;
  console.log(`invoking via HTTP ${method} ${url}`);

  try { 
    const data = _.get(opts, "body");
    
    let headers = {};

    const iamAuthHeader = _.get(opts, "iam_auth", false)
    if (iamAuthHeader) {
      headers = signHttpRequest(url)
    }
  
    const authHeader = _.get(opts, "auth")
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const res = await http.request({
      method, url, headers, data
    })

    return respondFrom(res);
  } catch (error) {
    if (error?.response?.status) {
      return {
        statusCode: error.response.status,
        headers: error.response.headers
      }
    } else {
      throw error;
    }
  }
}

const we_invoke_get_index = async () => {
  switch (mode) {
    case 'handler':
      return await viaHandler({}, 'get-index')
    case 'http':
      return await viaHttp('', 'GET')
    default:
      throw new Error(`unsupported mode: ${mode}`)
  }
}

const we_invoke_get_restaurants = async () => {
  switch (mode) {
    case 'handler':
      return await viaHandler({}, 'get-restaurants');
    case 'http':
      return await viaHttp('restaurants', 'GET', { iam_auth: true });
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
}; 

const we_invoke_search_restaurants = async (theme, user) => {
  const body = JSON.stringify({ theme });
  
  switch(mode) {
    case 'handler':
      return await viaHandler({ body }, 'search-restaurants');
    case 'http':
      const auth = user.idToken
      return await viaHttp('restaurants/search', 'POST', { body, auth })
    default:
      throw new Error(`unsupported mode: ${mode}`)
  }
}

module.exports = {
  we_invoke_get_index,
  we_invoke_get_restaurants,
  we_invoke_search_restaurants
}