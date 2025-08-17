"use strict";
var lutim = exports;
var request = require("request");
var Q = require("q");
var fs = require("fs");

var LUTIM_API_URL = "https://framapic.org/";

lutim._requestBuilder = function(operation, payload, inputParams) {
  var deferred = new Q.defer();
  var options = {
    uri: LUTIM_API_URL,
    method: null,
    encoding: "utf8",
    json: true
  };
  var params = {};

  if (inputParams && typeof inputParams !== "object") {
    deferred.reject(new Error("Invalid inputParams"));
    return deferred;
  } else if (inputParams && typeof inputParams === "object") {
    params = inputParams;
  }

  if (payload && typeof payload !== "string") {
    deferred.reject(new Error("Invalid payload"));
    return deferred;
  }

  if (!operation || typeof operation !== "string") {
    deferred.reject(new Error("Invalid operation"));
    return deferred.promise;
  }

  params.format = "json";

  switch (operation) {
    case "serverInfos":
      options.method = "GET";
      options.uri += "infos/";
      break;
    case "upload":
      options.method = "POST";
      options.formData = params;
      break;
    case "delete":
      options.method = "GET";
      options.uri += "d/" + payload;
      options.formData = params;
      break;
    case "modify":
      options.method = "POST";
      options.uri += "m/" + payload;
      options.formData = params;
      break;
    case "getImage":
      options.method = "GET";
      options.uri += payload;
      options.formData = params;
      break;
    case "imageInfos":
      options.method = "GET";
      options.uri += "about/" + payload;
      options.formData = params;
      break;
    case "imageCountStatus":
      options.method = "POST";
      options.uri += "c/";
      options.formData = params;
      break;
    default:
      deferred.reject(new Error("Invalid Operation"));
      return deferred.promise;
  }

  request(options, function(err, res, body) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(body);
    }
  });

  return deferred.promise;
};

/**
 * Set Lutim API URL
 * @param {string} URL - URL to make the API calls to lutim
 */
lutim.setAPIUrl = function(URL) {
  if (URL && typeof URL === "string") {
    LUTIM_API_URL = URL;
    if (URL.charAt(URL.length - 1) !== "/") {
      LUTIM_API_URL += "/";
    }
  }
};

/**
 * Get Lutim API Url
 * @returns {string} API Url
 */
lutim.getAPIUrl = function() {
  return LUTIM_API_URL;
};

/**
 * Request Lutim Info
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @returns {promise}
 */
lutim.getServerInfos = function() {
  var deferred = Q.defer();

  lutim
    ._requestBuilder("serverInfos")
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });
  return deferred.promise;
};

/**
 * Upload an image
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @param {string} file - full path to a binary image file
 * @param {number=} deleteDay - number of days you want the image to stay (default: 0 (undefinitely or the configured maximum delay of the server))
 * @param {number=} firstView - if not 0, the image will be deleted at first view (default: 0)
 * @param {number=} keepExif - if not 0, the image will keep its EXIF tags (default: 0)
 * @param {number=} crypt - if not 0, the image will be encrypted on the server (default: depends on the instance configuration)
 * @returns {promise}
 */
lutim.uploadImage = function(file, deleteDay, firstView, keepExif, crypt) {
  var deferred = Q.defer();
  var params = {};

  if (typeof deleteDay === "number") {
    params["delete_day"] = deleteDay;
  }

  if (typeof firstView === "number") {
    params["first-view"] = firstView;
  }

  if (typeof keepExif === "number") {
    params["keep-exif"] = keepExif;
  }

  if (typeof crypt === "number") {
    params.crypt = crypt;
  }

  if (typeof file === "string" || (file && file.length)) {
    params.file = fs.createReadStream(file);
  } else {
    deferred.reject(new Error("Invalid file path"));
    return deferred.promise;
  }

  lutim
    ._requestBuilder("upload", null, params)
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * Delete an image
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @param {string} realShort - image identifier
 * @param {string} token
 * @returns {promise}
 */
lutim.deleteImage = function(realShort, token) {
  var deferred = Q.defer();

  if (typeof realShort !== "string" || (realShort && realShort.length === 0)) {
    deferred.reject(new Error("Invalid real_short"));
    return deferred.promise;
  }

  if (typeof token !== "string" || (token && token.length === 0)) {
    deferred.reject(new Error("Invalid token"));
    return deferred.promise;
  }

  var payload = realShort + "/" + token;

  lutim
    ._requestBuilder("delete", payload)
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * Modify an image
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @param {string} realShort - image identifier
 * @param {string} token
 * @param {number} deleteDay - number of days you want the image to stay
 * @param {number=} firstView - if not 0, the image will be deleted at first view (default: 0)
 * @returns {promise}
 */
lutim.modifyImage = function(realShort, token, deleteDay, firstView) {
  var deferred = Q.defer();
  var params = {};

  if (typeof realShort !== "string" || (realShort && realShort.length === 0)) {
    deferred.reject(new Error("Invalid real_short"));
    return deferred.promise;
  }

  if (typeof token !== "string" || (token && token.length === 0)) {
    deferred.reject(new Error("Invalid token"));
    return deferred.promise;
  }

  if (typeof deleteDay !== "number") {
    deferred.reject(new Error("Invalid delete_day"));
    return deferred.promise;
  }

  params["delete_day"] = deleteDay;

  if (typeof firstView === "number") {
    params["first_view"] = firstView;
  }

  var payload = realShort + "/" + token;

  lutim
    ._requestBuilder("modify", payload, params)
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * Get an image
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @param {string} short - real_short + encryption key of the image
 * @returns {promise}
 */
lutim.getImage = function(short) {
  var deferred = Q.defer();

  if (typeof short !== "string" || (short && short.length === 0)) {
    deferred.reject(new Error("Invalid short"));
    return deferred.promise;
  }

  lutim
    ._requestBuilder("getImage", short)
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * Get informations about an image
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @param {string} realShort - image identifier
 * @returns {promise}
 */
lutim.getImageInfos = function(realShort) {
  var deferred = Q.defer();

  if (typeof realShort !== "string" || (realShort && realShort.length === 0)) {
    deferred.reject(new Error("Invalid short"));
    return deferred.promise;
  }

  lutim
    ._requestBuilder("imageInfos", realShort)
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * Get count and status of an image
 * @link https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API
 * @param {string} short - real_short + encryption key of the image
 * @param {string} token
 * @returns {promise}
 */
lutim.getImageCountAndStatus = function(short, token) {
  var deferred = Q.defer();
  var params = {};

  if (typeof short !== "string" || (short && short.length === 0)) {
    deferred.reject(new Error("Invalid short"));
    return deferred.promise;
  }

  if (typeof token !== "string" || (short && token.length === 0)) {
    deferred.reject(new Error("Invalid token"));
    return deferred.promise;
  }

  params.short = short;
  params.token = token;

  lutim
    ._requestBuilder("imageCountStatus", null, params)
    .then(function(json) {
      deferred.resolve(json);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};
