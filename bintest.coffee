class Http
  constructor: ->
    
  getBinary: (uri) ->
    deferred = new Deferred
    xhr = new XMLHttpRequest
    xhr.onreadystatechange = ->
      if xhr.readyState == 4
        if xhr.status == 200
          deferred.call xhr
        else
          deferred.fail xhr
    xhr.overrideMimeType 'text/plain; charset=x-user-defined'

    deferred.canceller = -> 
      xhr.abort

    xhr.open 'GET', uri
    xhr.send()

    deferred

http = new Http

Deferred.next ->
  (http.getBinary 'miku.pmd').next (xhr) ->
    bin = new MMD_GL.Binary xhr.responseText
    headText = MMD_GL.decodeSJIS (bin.readUint8 3)
    console.log headText
.next ->
  console.log 'next operation'
.error (e) ->
  alert e