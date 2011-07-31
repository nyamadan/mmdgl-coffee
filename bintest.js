(function() {
  var Http, http;
  Http = (function() {
    function Http() {}
    Http.prototype.getBinary = function(uri) {
      var deferred, xhr;
      deferred = new Deferred;
      xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            return deferred.call(xhr);
          } else {
            return deferred.fail(xhr);
          }
        }
      };
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
      deferred.canceller = function() {
        return xhr.abort;
      };
      xhr.open('GET', uri);
      xhr.send();
      return deferred;
    };
    return Http;
  })();
  http = new Http;
  Deferred.next(function() {
    return (http.getBinary('miku.pmd')).next(function(xhr) {
      var bin, headText;
      bin = new MMD_GL.Binary(xhr.responseText);
      headText = MMD_GL.decodeSJIS(bin.readUint8(3));
      return console.log(headText);
    });
  }).next(function() {
    return console.log('next operation');
  }).error(function(e) {
    return alert(e);
  });
}).call(this);
