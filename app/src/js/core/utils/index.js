module.exports = exports = {};

exports.ab2str = function(buf) {
    return new TextDecoder("utf-8").decode(new Uint8Array(buf));
}

exports.str2ab = function(str) {
    return new ArrayBuffer(new TextEncoder("utf-8").encode(str));
}

exports.str2uint8arr = function(str) {
    return new Uint8Array(new TextEncoder("utf-8").encode(str));
}

exports.uint8arr2ab = function(arr) {
    var buf = new ArrayBuffer(arr.length);
    var bufView = new Uint8Array(buf);

    for (var i = 0, len = arr.length; i < len; i++) {
        bufView[i] = arr[i];
    }

    return buf;
}

exports.uint8arr2str = function(arr) {
    return new TextDecoder("utf-8").decode(arr);
}

exports.toHexString = function(arr) {
  var result = "";

  for (var i = 0, len = arr.length; i < len; i++) {
      var str = arr[i].toString(16);
      if (str.length < 2) {
        str = `0${str}`;
      }
      result += str;
  }

  return result;
}

exports.toByteArray = function(str) {
  var result = [];

  for (var i = 0, len = str.length; i < len; i+=2) {
      result.push(parseInt(str.substr(i,2),16));
  }

  while(result.length <6 ){
      result.push(0);
  }

  return result;
}
