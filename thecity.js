var request = require('request');
var crypto = require('crypto');
var querystring = require('querystring');

var root_url = 'https://api.onthecity.org';

// a security token and key is needed for the hmac signature. https://api.onthecity.org/docs/admin#security_and_auth
var token =  null;
var key = null;

var thecityRequest = function(path, successCallback, errorCallback) {
  if(token == null || key == null) {
    console.error("Need to run .init() first to pass in token and secret key");
    return;
  }

  var seconds = Math.floor((new Date).getTime() / 1000);
  var string_to_sign = seconds.toString() + 'GET' + root_url + path;
  var hmac = crypto.createHmac('sha256', key);
  hmac.setEncoding('base64');
  hmac.write(string_to_sign);
  hmac.end();
  var hmac_sig = encodeURIComponent(hmac.read());
  var options = {
    url: root_url + path,
    headers: {
      'X-City-Sig': hmac_sig,
      'X-City-User-Token': token,
      'X-City-Time': seconds,
      'Accept': 'application/vnd.thecity.admin.v1+json',
      'Content-Type': 'application/json',
    }
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200 && successCallback) {
      successCallback(JSON.parse(body));
    } else if (errorCallback) {
      errorCallback(response, body);
    }
  });
}

module.exports = {
  init: function(thecityToken, thecityKey) {
    token = thecityToken;
    key = thecityKey;
  },
  user: {
    show: function(userId, successCallback, errorCallback) {
      thecityRequest('/users/' + userId, successCallback, errorCallback);
    },
    // Deprecated, use show() instead.
    get: function(userId, successCallback, errorCallback) {
      this.show(userId, successCallback, errorCallback);
    },
    addresses: {
      list: function(userId, successCallback, errorCallback) {
        thecityRequest('/users/' + userId + '/addresses', successCallback, errorCallback);
      },
      show: function(userId, addressId, successCallback, errorCallback) {
        thecityRequest('/users/' + userId + '/addresses/' + addressId, successCallback, errorCallback);
      },
      // Deprecated, use user.addresses.show() instead.
      get: function(userId, addressId, successCallback, errorCallback) {
        this.user.addresses.show(userId, addressId, successCallback, errorCallback);
      }
    },
    family: {
      list: function(userId, successCallback, errorCallback) {
        thecityRequest('/users/' + userId + '/family', successCallback, errorCallback);
      }
    }
  },
  group: {
    index: function(params, successCallback, errorCallback) {
      if(typeof params === 'function') {
        errorCallback = successCallback;
        successCallback = params;
        params = {};
      }
      thecityRequest('/groups?' + querystring.stringify(params), successCallback, errorCallback);
    },
    show: function(groupId, successCallback, errorCallback) {
      thecityRequest('/groups/' + groupId, successCallback, errorCallback);
    }
  },
  call: function(route, params, successCallback, errorCallback) {
    if(typeof route !== 'string') {
      throw new Error('Route must be defined.');
    }
    if(typeof params === 'function') {
      errorCallback = successCallback;
      successCallback = params;
      params = {};
    }
    thecityRequest(route + '?' + querystring.stringify(params), successCallback, errorCallback);
  }
}