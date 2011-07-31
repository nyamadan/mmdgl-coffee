(function() {
  if (!(window.MMD_GL != null)) {
    window.MMD_GL = {};
  }
  MMD_GL.Binary = (function() {
    function Binary(blob) {
      this.blob = blob;
      this.pos = 0;
    }
    Binary.prototype.read = function(type, elemSize, length) {
      var bufSize, buffer, byteBuffer, c, i;
      bufSize = elemSize * length;
      buffer = new ArrayBuffer(bufSize);
      byteBuffer = new Uint8Array(buffer, 0, bufSize);
      c = this.blob[this.pos];
      i = 0;
      while (i < bufSize) {
        byteBuffer[i++] = (this.blob.charCodeAt(this.pos++)) & 0xff;
      }
      return new type(buffer, 0, bufSize);
    };
    Binary.prototype.readUint8 = function(length) {
      return this.read(Uint8Array, 1, length);
    };
    Binary.prototype.readInt8 = function(length) {
      return this.read(Int8Array, 1, length);
    };
    Binary.prototype.readUint16 = function(length) {
      return this.read(Uint16Array, 2, length);
    };
    Binary.prototype.readInt16 = function(length) {
      return this.read(Int16Array, 2, length);
    };
    Binary.prototype.readUint32 = function(length) {
      return this.read(Uint32Array, 4, length);
    };
    Binary.prototype.readInt32 = function(length) {
      return this.read(Int32Array, 4, length);
    };
    Binary.prototype.readFloat32 = function(length) {
      return this.read(Float32Array, 4, length);
    };
    Binary.prototype.readFloat64 = function(length) {
      return this.read(Float64Array, 4, length);
    };
    return Binary;
  })();
  MMD_GL.decodeSJIS = function(charCodeArray) {
    var ch, code, str, _i, _len;
    str = '';
    ch = '';
    for (_i = 0, _len = charCodeArray.length; _i < _len; _i++) {
      code = charCodeArray[_i];
      if (code === 0) {
        break;
      }
      ch = (code.toString(16)).toUpperCase();
      while (ch.length < 2) {
        ch = '0' + ch;
      }
      str += '%' + ch;
    }
    return UnescapeSJIS(str);
  };
}).call(this);
