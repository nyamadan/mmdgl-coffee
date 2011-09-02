(function() {
  var _ref;
    if ((_ref = window.MMD_GL) != null) {
    _ref;
  } else {
    window.MMD_GL = {};
  };
  MMD_GL.debug = true;
  MMD_GL.getWhitePixelTexture = (function() {
    var texture;
    texture = null;
    return function() {
      if (texture != null) {
        return texture;
      } else {
        return texture = new tdl.textures.SolidTexture([255, 255, 255, 255]);
      }
    };
  })();
  MMD_GL.getConeModel = (function() {
    var model;
    model = null;
    return function() {
      var program;
      if (model != null) {
        return model;
      } else {
        program = tdl.programs.loadProgram(MMD_GL.vertexShaderScript['color0'], MMD_GL.fragmentShaderScript['color0']);
        if (!(program != null)) {
          throw "*** Error compiling shader : " + tdl.programs.lastError;
        }
        return model = new tdl.models.Model(program, new tdl.primitives.createTruncatedCone(0.25, 0.0, 1.0, 3, 1));
      }
    };
  })();
  MMD_GL.getSphereModel = (function() {
    var model;
    model = null;
    return function() {
      var program;
      if (model != null) {
        return model;
      } else {
        program = tdl.programs.loadProgram(MMD_GL.vertexShaderScript['color0'], MMD_GL.fragmentShaderScript['color0']);
        if (!(program != null)) {
          throw "*** Error compiling shader : " + tdl.programs.lastError;
        }
        return model = new tdl.models.Model(program, new tdl.primitives.createSphere(0.5, 8, 8));
      }
    };
  })();
  MMD_GL.vertexShaderScript = {
    toon0: 'uniform mat4 world;\nuniform mat4 worldViewProjection;\n\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 coord0;\n\nvarying vec4 vPosition;\nvarying vec4 vNormal;\nvarying vec2 vCoord0;\n\nvoid main() {\n\n    vPosition = world * vec4(position, 1.0);\n\n    vNormal = vec4((world * vec4(normal + position, 1.0)).xyz - vPosition.xyz, 1.0);\n    \n    vCoord0 = coord0;\n\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n}',
    color0: 'uniform mat4 worldViewProjection;\n\nattribute vec3 position;\n\nvoid main() {\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n}'
  };
  MMD_GL.fragmentShaderScript = {
    toon0: '#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec3 dlDirection;\nuniform vec3 dlColor;\n\nuniform vec3 color;\nuniform vec3 specular;\nuniform float shiness;\nuniform vec3 ambient;\n\nuniform sampler2D tex0;\nuniform sampler2D texToon;\n\nuniform vec3 eyeVec;\n\nvarying vec4 vPosition;\nvarying vec4 vNormal;\nvarying vec2 vCoord0;\n\nfloat saturate(float x) {\n    return max(min(x, 1.0), 0.0);\n}\n\nvoid main() {\n    float normalDotLight = saturate(dot(vNormal.xyz, -dlDirection));\n\n    vec3 spcColor = specular * pow(saturate(dot(reflect(-dlDirection, vNormal.xyz), eyeVec)), shiness);\n    vec3 ambColor = ambient;\n    vec3 tex0Color = texture2D(tex0, vCoord0).xyz;\n    vec3 texToonColor = texture2D(texToon, vec2(0.5, 1.0 - normalDotLight)).xyz;\n    vec3 dstColor = texToonColor * tex0Color * (color * dlColor + ambient * ambColor + spcColor) ;\n\n    gl_FragColor = vec4(dstColor, 1.0);\n}',
    color0: '#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec3 color;\n\nvoid main() {\n    gl_FragColor = vec4(color, 1.0);\n}'
  };
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
      ch = code.toString(16).toUpperCase();
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
      this.edgeFlag = false;
    }
    PMDMaterial.prototype.clone = function() {
      var dst;
      dst = new MMD_GL.PMDMaterial;
      dst.color = new Float32Array(this.color);
      dst.opacity = this.opacity;
      dst.shiness = this.shiness;
      dst.specular = new Float32Array(this.specular);
      dst.ambient = new Float32Array(this.ambient);
      dst.edgeFlag = this.edgeFlag;
      return dst;
    };
    return PMDMaterial;
  })();
  MMD_GL.Bone = (function() {
    function Bone() {
      this.name = '';
      this.parentIndex = 0;
      this.tailIndex = 0;
      this.type = 0;
      this.parentIkIndex = 0;
      this.pos = new Float32Array([0.0, 0.0, 0.0]);
    }
    Bone.prototype.clone = function() {
      var dst;
      dst = new MMD_GL.Bone;
      dst.name = this.name;
      dst.parentIndex = this.parentIndex;
      dst.tailIndex = this.tailIndex;
      dst.type = this.type;
      dst.parentIkIndex = this.parentIkIndex;
      dst.pos = this.pos;
      return dst;
    };
    return Bone;
  })();
  MMD_GL.Mesh = (function() {
    function Mesh() {
      this.bones = [];
      this.boneIndices = [];
      this.boneWeights = [];
      this.models = [];
      this.materials = [];
    }
    Mesh.prototype.draw = function(prep) {
      var i, model, _len, _ref2;
      _ref2 = this.models;
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        model = _ref2[i];
        model.drawPrep(prep);
        model.draw(this.materials[i]);
      }
    };
    Mesh.prototype.drawBone = function(world, viewProjection) {
      var bone, boneDir, boneLength, coneModel, midPos, sphereModel, world2, worldViewProjection, x, y, z, _i, _j, _len, _len2, _ref2, _ref3;
      world2 = new Float32Array(world);
      worldViewProjection = new Float32Array(16);
      coneModel = MMD_GL.getConeModel();
      sphereModel = MMD_GL.getSphereModel();
      coneModel.drawPrep();
      _ref2 = this.bones;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        bone = _ref2[_i];
        if (bone.type === 6 || bone.type === 7) {
          continue;
        }
        boneDir = tdl.math.subVector(this.bones[bone.tailIndex].pos, bone.pos);
        boneLength = tdl.math.length(boneDir);
        midPos = tdl.math.mulVectorScalar(tdl.math.addVector(this.bones[bone.tailIndex].pos, bone.pos), 0.5);
        y = tdl.math.normalize(boneDir);
        z = tdl.math.normalize(tdl.math.cross([0, 1, 0], y));
        if (tdl.math.lengthSquared(z) < 0.001) {
          z = [0, 0, 1];
        }
        x = tdl.math.normalize(tdl.math.cross(y, z));
        world2 = tdl.math.matrix4.copy(world);
        world2 = tdl.math.matrix4.mul(new Float32Array([x[0], x[1], x[2], 0, y[0] * boneLength, y[1] * boneLength, y[2] * boneLength, 0, z[0], z[1], z[2], 0, midPos[0], midPos[1], midPos[2], 1]), world2);
        tdl.fast.matrix4.mul(worldViewProjection, world2, viewProjection);
        coneModel.draw({
          color: new Float32Array([0.8, 0.0, 0.0]),
          worldViewProjection: worldViewProjection
        });
      }
      sphereModel.drawPrep();
      _ref3 = this.bones;
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        bone = _ref3[_j];
        world2 = tdl.math.matrix4.copy(world);
        world2 = tdl.math.matrix4.mul(new Float32Array([0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, bone.pos[0], bone.pos[1], bone.pos[2], 1]), world2);
        tdl.fast.matrix4.mul(worldViewProjection, world2, viewProjection);
        sphereModel.draw({
          color: new Float32Array([0.8, 0.8, 0.8]),
          worldViewProjection: worldViewProjection
        });
      }
    };
    return Mesh;
  })();
  MMD_GL.PMD = (function() {
    function PMD(bin) {
      var bone, i, indexNum, indices, j, material, materialIndexNum, offset, texturePath, toonIndex, vertNum, _fn, _len, _ref2, _ref3, _step;
      if (MMD_GL.decodeSJIS(bin.readUint8(3)) !== 'Pmd') {
        throw 'bin is not pmd data';
      }
      this.version = (bin.readFloat32(1))[0];
      this.modelName = MMD_GL.decodeSJIS(bin.readUint8(20));
      this.comment = MMD_GL.decodeSJIS(bin.readUint8(256));
      vertNum = (bin.readUint32(1))[0];
      this.positions = new Float32Array(vertNum * 3);
      this.normals = new Float32Array(vertNum * 3);
      this.coord0s = new Float32Array(vertNum * 2);
      this.boneIndices = new Array(vertNum);
      this.boneWeights = new Float32Array(vertNum);
      this.edgeFlags = new Uint8Array(vertNum);
      for (i = 0; 0 <= vertNum ? i < vertNum : i > vertNum; 0 <= vertNum ? i++ : i--) {
        this.positions[i * 3 + 0] = (bin.readFloat32(1))[0];
        this.positions[i * 3 + 1] = (bin.readFloat32(1))[0];
        this.positions[i * 3 + 2] = -(bin.readFloat32(1))[0];
        this.normals[i * 3 + 0] = (bin.readFloat32(1))[0];
        this.normals[i * 3 + 1] = (bin.readFloat32(1))[0];
        this.normals[i * 3 + 2] = -(bin.readFloat32(1))[0];
        this.coord0s[i * 2 + 0] = (bin.readFloat32(1))[0];
        this.coord0s[i * 2 + 1] = (bin.readFloat32(1))[0];
        this.boneIndices[i] = bin.readUint16(2);
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
          material.texToon = tdl.textures.loadTexture("toon0" + (toonIndex + 1) + ".bmp");
        } else if ((99 > toonIndex && toonIndex >= 9)) {
          material.texToon = tdl.textures.loadTexture("toon" + (toonIndex + 1) + ".bmp");
        } else {
          material.texToon = MMD_GL.getWhitePixelTexture();
        }
        materialIndexNum = parseInt((bin.readUint32(1))[0], 10);
        texturePath = MMD_GL.decodeSJIS(bin.readUint8(20));
        material.tex0 = texturePath.length > 0 ? tdl.textures.loadTexture(texturePath) : MMD_GL.getWhitePixelTexture();
        this.materials[i] = material;
        this.indices[i] = new Uint16Array(materialIndexNum);
        for (j = 0; 0 <= materialIndexNum ? j < materialIndexNum : j > materialIndexNum; 0 <= materialIndexNum ? j++ : j--) {
          this.indices[i][j] = indices[offset + j];
        }
        offset += materialIndexNum;
      }
      this.bones = new Array((bin.readUint16(1))[0]);
      _ref3 = this.bones;
      for (i = 0, _len = _ref3.length; i < _len; i++) {
        bone = _ref3[i];
        bone = new MMD_GL.Bone;
        bone.name = MMD_GL.decodeSJIS(bin.readUint8(20));
        bone.parentIndex = (bin.readUint16(1))[0];
        bone.tailIndex = (bin.readUint16(1))[0];
        bone.type = (bin.readUint8(1))[0];
        bone.parentIkIndex = (bin.readUint16(1))[0];
        bone.pos = bin.readFloat32(3);
        bone.pos[2] = -bone.pos[2];
        this.bones[i] = bone;
      }
      return;
    }
    PMD.prototype.createMesh = function() {
      var arrays, bone, boneIndex, coord0, i, indices, mesh, model, normal, position, program, textures, _len, _ref2;
      program = tdl.programs.loadProgram(MMD_GL.vertexShaderScript['toon0'], MMD_GL.fragmentShaderScript['toon0']);
      if (!(program != null)) {
        throw "*** Error compiling shader : " + tdl.programs.lastError;
      }
      mesh = new MMD_GL.Mesh;
      mesh.boneWeights = new Float32Array(this.boneWeights);
      mesh.boneIndices = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.boneIndices;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          boneIndex = _ref2[_i];
          _results.push(new Uint16Array(boneIndex));
        }
        return _results;
      }).call(this);
      mesh.bones = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.bones;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          bone = _ref2[_i];
          _results.push(bone.clone());
        }
        return _results;
      }).call(this);
      position = new tdl.primitives.AttribBuffer(3, this.positions);
      normal = new tdl.primitives.AttribBuffer(3, this.normals);
      coord0 = new tdl.primitives.AttribBuffer(2, this.coord0s);
      mesh.models = new Array(this.materials.length);
      mesh.materials = new Array(this.materials.length);
      _ref2 = mesh.models;
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        model = _ref2[i];
        indices = new tdl.primitives.AttribBuffer(3, this.indices[i], 'Uint16Array');
        arrays = {
          indices: indices,
          position: position,
          normal: normal,
          coord0: coord0
        };
        textures = {};
        if (this.materials[i].tex0 != null) {
          textures.tex0 = this.materials[i].tex0;
        }
        if (this.materials[i].texToon != null) {
          textures.texToon = this.materials[i].texToon;
        }
        mesh.models[i] = new tdl.models.Model(program, arrays, textures);
        mesh.materials[i] = this.materials[i].clone();
      }
      return mesh;
    };
    return PMD;
  })();
}).call(this);
