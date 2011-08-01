(function() {
  var _ref;
    if ((_ref = window.MMD_GL) != null) {
    _ref;
  } else {
    window.MMD_GL = {};
  };
  MMD_GL.debug = true;
  MMD_GL.Binary = (function() {
    function Binary(binStr) {
      this.binStr = binStr;
      this.pos = 0;
    }
    Binary.prototype.read = function(type, elemSize, length) {
      var bufSize, buffer, byteBuffer, c, i;
      bufSize = elemSize * length;
      buffer = new ArrayBuffer(bufSize);
      byteBuffer = new Uint8Array(buffer, 0, bufSize);
      c = this.binStr[this.pos];
      for (i = 0; 0 <= bufSize ? i < bufSize : i > bufSize; 0 <= bufSize ? i++ : i--) {
        byteBuffer[i] = (this.binStr.charCodeAt(this.pos++)) & 0xff;
      }
      return new type(buffer, 0, length);
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
      return this.read(Float64Array, 8, length);
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
  MMD_GL.PMDMaterial = (function() {
    function PMDMaterial() {
      this.color = new Float32Array([0.0, 0.0, 0.0]);
      this.opacity = 0.0;
      this.shiness = 0.0;
      this.specular = new Float32Array([0.0, 0.0, 0.0]);
      this.ambient = new Float32Array([0.0, 0.0, 0.0]);
    }
    return PMDMaterial;
  })();
  MMD_GL.PMD = (function() {
    function PMD(bin) {
      var i, indexNum, indices, j, material, materialIndexNum, offset, texturePath, toonIndex, vertNum, _fn, _ref2, _step;
      if (MMD_GL.decodeSJIS(bin.readUint8(3)) !== 'Pmd') {
        throw 'bin is not pmd data';
      }
      this.version = (bin.readFloat32(1))[0];
      this.modelName = MMD_GL.decodeSJIS(bin.readUint8(20));
      this.comment = MMD_GL.decodeSJIS(bin.readUint8(256));
      vertNum = (bin.readUint32(1))[0];
      this.position = new Float32Array(vertNum * 3);
      this.normals = new Float32Array(vertNum * 3);
      this.coord0s = new Float32Array(vertNum * 2);
      this.bone0s = new Uint16Array(vertNum);
      this.bone1s = new Uint16Array(vertNum);
      this.boneWeights = new Float32Array(vertNum);
      this.edgeFlags = new Uint8Array(vertNum);
      for (i = 0; 0 <= vertNum ? i < vertNum : i > vertNum; 0 <= vertNum ? i++ : i--) {
        this.position[i * 3 + 0] = (bin.readFloat32(1))[0];
        this.position[i * 3 + 1] = (bin.readFloat32(1))[0];
        this.position[i * 3 + 2] = (-bin.readFloat32(1))[0];
        this.normals[i * 3 + 0] = (bin.readFloat32(1))[0];
        this.normals[i * 3 + 1] = (bin.readFloat32(1))[0];
        this.normals[i * 3 + 2] = (-bin.readFloat32(1))[0];
        this.coord0s[i * 2 + 0] = (bin.readFloat32(1))[0];
        this.coord0s[i * 2 + 1] = (bin.readFloat32(1))[0];
        this.bone0s[i] = (bin.readUint16(1))[0];
        this.bone1s[i] = (bin.readUint16(1))[0];
        this.boneWeights[i] = (bin.readUint8(1))[0] / 100.0;
        this.edgeFlags[i] = (bin.readUint8(1))[0] ? true : false;
      }
      indexNum = (bin.readUint32(1))[0];
      indices = bin.readUint16(indexNum);
      _fn = function(i) {
        var tmp;
        tmp = indices[i + 1];
        indices[i + 1] = indices[i + 2];
        return indices[i + 2] = tmp;
      };
      for (i = 0, _step = 3; 0 <= indexNum ? i < indexNum : i > indexNum; i += _step) {
        _fn(i);
      }
      this.materials = new Array((bin.readUint32(1))[0]);
      this.indices = new Array(this.materials.length);
      texturePath = '';
      toonIndex = null;
      offset = 0;
      for (i = 0, _ref2 = this.materials.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
        material = new MMD_GL.PMDMaterial;
        material.color = bin.readFloat32(3);
        material.opacity = (bin.readFloat32(1))[0];
        material.shiness = (bin.readFloat32(1))[0];
        material.specular = bin.readFloat32(3);
        material.ambient = bin.readFloat32(3);
        toonIndex = (bin.readUint8(1))[0];
        material.edgeFlag = (bin.readUint8(1))[0] ? true : false;
        if ((9 > toonIndex && toonIndex >= 0)) {
          material.texToon = "toon0" + (toonIndex + 1) + ".bmp";
        } else if ((99 > toonIndex && toonIndex >= 9)) {
          material.texToon = "toon" + (toonIndex + 1) + ".bmp";
        } else {
          material.texToon = null;
        }
        materialIndexNum = ~~((bin.readUint32(1))[0] * 1);
        texturePath = MMD_GL.decodeSJIS(bin.readUint8(20));
        this.materials[i] = material;
        this.indices[i] = new Uint16Array(materialIndexNum);
        for (j = 0; 0 <= materialIndexNum ? j < materialIndexNum : j > materialIndexNum; 0 <= materialIndexNum ? j++ : j--) {
          this.indices[i][j] = indices[offset + j];
        }
        offset += materialIndexNum;
      }
    }
    return PMD;
  })();
}).call(this);
