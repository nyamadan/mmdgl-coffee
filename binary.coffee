class MMD_GL.Binary
  constructor: (@blob) ->
    @pos = 0
  
  read: (type, elemSize, length) ->
    bufSize = elemSize * length
    buffer = new ArrayBuffer bufSize

    byteBuffer = new Uint8Array buffer, 0, bufSize

    c = @blob[@pos]
    i = 0
    byteBuffer[i++] = (@blob.charCodeAt @pos++) & 0xff while i < bufSize
    return new type buffer, 0, bufSize

  readUint8: (length) ->
    @read Uint8Array, 1, length

  readInt8: (length) ->
    @read Int8Array, 1, length

  readUint16: (length) ->
    @read Uint16Array, 2, length

  readInt16: (length) ->
    @read Int16Array, 2, length

  readUint32: (length) ->
    @read Uint32Array, 4, length

  readInt32: (length) ->
    @read Int32Array, 4, length

  readFloat32: (length) ->
    @read Float32Array, 4, length

  readFloat64: (length) ->
    @read Float64Array, 4, length