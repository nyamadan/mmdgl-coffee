(function() {
  var _ref;
  if ((_ref = window.MMD_GL) == null) {
    window.MMD_GL = {};
  }
  MMD_GL.debug = (function() {
    var f;
    f = 0.0;
    return {
      getCurrFloat: function() {
        return f;
      },
      getNextFloat: function() {
        f += 1.0;
        return f;
      },
      putsGLparam: function(pname) {
        var pnameList, value, _i, _len;
        pnameList = ['ACTIVE_TEXTURE', 'ALIASED_LINE_WIDTH_RANGE', 'ALIASED_POINT_SIZE_RANGE', 'ALPHA_BITS', 'ARRAY_BUFFER_BINDING', 'BLEND', 'BLEND_COLOR', 'BLEND_DST_ALPHA', 'BLEND_DST_RGB', 'BLEND_EQUATION_ALPHA', 'BLEND_EQUATION_RGB', 'BLEND_SRC_ALPHA', 'BLEND_SRC_RGB', 'BLUE_BITS', 'COLOR_CLEAR_VALUE', 'COLOR_WRITEMASK', 'COMPRESSED_TEXTURE_FORMATS', 'CULL_FACE', 'CULL_FACE_MODE', 'CURRENT_PROGRAM', 'DEPTH_BITS', 'DEPTH_CLEAR_VALUE', 'DEPTH_FUNC', 'DEPTH_RANGE', 'DEPTH_TEST', 'DEPTH_WRITEMASK', 'DITHER', 'ELEMENT_ARRAY_BUFFER_BINDING', 'FRAMEBUFFER_BINDING', 'FRONT_FACE', 'GENERATE_MIPMAP_HINT', 'GREEN_BITS', 'LINE_WIDTH', 'MAX_COMBINED_TEXTURE_IMAGE_UNITS', 'MAX_CUBE_MAP_TEXTURE_SIZE', 'MAX_FRAGMENT_UNIFORM_VECTORS', 'MAX_RENDERBUFFER_SIZE', 'MAX_TEXTURE_IMAGE_UNITS', 'MAX_TEXTURE_SIZE', 'MAX_VARYING_VECTORS', 'MAX_VERTEX_ATTRIBS', 'MAX_VERTEX_TEXTURE_IMAGE_UNITS', 'MAX_VERTEX_UNIFORM_VECTORS', 'MAX_VIEWPORT_DIMS', 'NUM_COMPRESSED_TEXTURE_FORMATS', 'PACK_ALIGNMENT', 'POLYGON_OFFSET_FACTOR', 'POLYGON_OFFSET_FILL', 'POLYGON_OFFSET_UNITS', 'RED_BITS', 'RENDERBUFFER_BINDING', 'RENDERER', 'SAMPLE_BUFFERS', 'SAMPLE_COVERAGE_INVERT', 'SAMPLE_COVERAGE_VALUE', 'SAMPLES', 'SCISSOR_BOX', 'SCISSOR_TEST', 'SHADING_LANGUAGE_VERSION', 'STENCIL_BACK_FAIL', 'STENCIL_BACK_FUNC', 'STENCIL_BACK_PASS_DEPTH_FAIL', 'STENCIL_BACK_PASS_DEPTH_PASS', 'STENCIL_BACK_REF', 'STENCIL_BACK_VALUE_MASK', 'STENCIL_BACK_WRITEMASK', 'STENCIL_BITS', 'STENCIL_CLEAR_VALUE', 'STENCIL_FAIL', 'STENCIL_FUNC', 'STENCIL_PASS_DEPTH_FAIL', 'STENCIL_PASS_DEPTH_PASS', 'STENCIL_REF', 'STENCIL_TEST', 'STENCIL_VALUE_MASK', 'STENCIL_WRITEMASK', 'SUBPIXEL_BITS', 'TEXTURE_BINDING_2D', 'TEXTURE_BINDING_CUBE_MAP', 'UNPACK_ALIGNMENT', 'UNPACK_COLORSPACE_CONVERSION_WEBGL', 'UNPACK_FLIP_Y_WEBGL', 'UNPACK_PREMULTIPLY_ALPHA_WEBGL', 'VENDOR', 'VERSION', 'VIEWPORT'];
        if (pname != null) {
          value = "" + pname + " : " + (gl.getParameter(gl[pname]));
        } else {
          for (_i = 0, _len = pnameList.length; _i < _len; _i++) {
            pname = pnameList[_i];
            console.log("" + pname + " : " + (gl.getParameter(gl[pname])));
          }
        }
      }
    };
  })();
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
    toon0: 'uniform mat4 world;\nuniform mat4 view;\nuniform mat4 projection;\n\nuniform sampler2D texBone;\n\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 coord0;\n\nattribute vec2 boneIndices;\nattribute float boneWeights;\n\nvarying vec4 vPosition;\nvarying vec4 vNormal;\nvarying vec2 vCoord0;\n\nvoid main() {\n    vec4 v0; vec4 v1; vec4 v2; vec4 v3;\n    float halfSize = 1.0 / 512.0;\n    vec2 bone0 = vec2(boneIndices.x, 0.0);\n    vec2 bone1 = vec2(boneIndices.y, 0.0);\n    bone0.x = (bone0.x * 2.0 + 1.0) * halfSize;\n    bone1.x = (bone1.x * 2.0 + 1.0) * halfSize;\n    bone0.y = (bone0.y * 8.0 + 1.0) * halfSize;\n    bone1.y = (bone1.y * 8.0 + 1.0) * halfSize;\n    v0 = texture2D(texBone, vec2(bone0.x, bone0.y + 0.0 * halfSize));\n    v1 = texture2D(texBone, vec2(bone0.x, bone0.y + 2.0 * halfSize));\n    v2 = texture2D(texBone, vec2(bone0.x, bone0.y + 4.0 * halfSize));\n    v3 = texture2D(texBone, vec2(bone0.x, bone0.y + 6.0* halfSize));\n    mat4 mBone0 = mat4(v0, v1, v2, v3);\n\n    v0 = texture2D(texBone, vec2(bone1.x, bone1.y + 0.0 * halfSize));\n    v1 = texture2D(texBone, vec2(bone1.x, bone1.y + 2.0 * halfSize));\n    v2 = texture2D(texBone, vec2(bone1.x, bone1.y + 4.0 * halfSize));\n    v3 = texture2D(texBone, vec2(bone1.x, bone1.y + 6.0 * halfSize));\n    mat4 mBone1 = mat4(v0, v1, v2, v3);\n\n    mat4 mBone = mBone0 * boneWeights + mBone1 * (1.0 - boneWeights);\n\n    v0 = texture2D(texBone, vec2(bone0.x, bone0.y + 8.0 * halfSize));\n    v1 = texture2D(texBone, vec2(bone0.x, bone0.y + 10.0 * halfSize));\n    v2 = texture2D(texBone, vec2(bone0.x, bone0.y + 12.0 *  halfSize));\n    v3 = texture2D(texBone, vec2(bone0.x, bone0.y + 14.0 * halfSize));\n    mat4 mInv0 = mat4(v0, v1, v2, v3);\n\n    v0 = texture2D(texBone, vec2(bone1.x, bone1.y + 8.0 * halfSize));\n    v1 = texture2D(texBone, vec2(bone1.x, bone1.y + 10.0 * halfSize));\n    v2 = texture2D(texBone, vec2(bone1.x, bone1.y + 12.0 * halfSize));\n    v3 = texture2D(texBone, vec2(bone1.x, bone1.y + 14.0 * halfSize));\n    mat4 mInv1 = mat4(v0, v1, v2, v3);\n    mat4 mInv = mInv0 * boneWeights + mInv1 * (1.0 - boneWeights);\n\n    vPosition = world * vec4(position, 1.0);\n\n    vNormal = vec4((world * vec4(normal + position, 1.0)).xyz - vPosition.xyz, 1.0);\n    vCoord0 = coord0;\n\n    gl_Position = projection * view * world * mBone * mInv * vec4(position, 1.0);\n}',
    color0: 'uniform mat4 world;\nuniform mat4 view;\nuniform mat4 projection;\nattribute vec3 position;\n\nvoid main() {\n    gl_Position = projection * view * world * vec4(position, 1.0);\n}',
    bone0: 'uniform vec2 boneIndex;\nuniform mat4 boneMatrix;\n\nattribute float colIndex;\nattribute vec3 position;\n\nvarying vec4 vColor;\n\nvoid main() {\n    float x = 0.0;\n    float y = 0.0;\n    x = -1.0 + (position.x + boneIndex.x + 0.5) / 128.0;\n    y = -1.0 + (position.y + boneIndex.y * 4.0 + 0.5) / 128.0;\n    vColor = vec4(boneMatrix[int(colIndex)]);\n    gl_Position = vec4(x, y, 0.0, 1.0);\n}'
  };
  MMD_GL.fragmentShaderScript = {
    toon0: '#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec3 dlDirection;\nuniform vec3 dlColor;\n\nuniform vec3 color;\nuniform vec3 specular;\nuniform float shiness;\nuniform vec3 ambient;\n\nuniform sampler2D tex0;\nuniform sampler2D texToon;\n\nuniform vec3 eyeVec;\n\nvarying vec4 vPosition;\nvarying vec4 vNormal;\nvarying vec2 vCoord0;\n\nfloat saturate(float x) {\n    return max(min(x, 1.0), 0.0);\n}\n\nvoid main() {\n    float normalDotLight = saturate(dot(vNormal.xyz, -dlDirection));\n\n    vec3 spcColor = specular * pow(saturate(dot(reflect(-dlDirection, vNormal.xyz), eyeVec)), shiness);\n    vec3 ambColor = ambient;\n    vec3 tex0Color = texture2D(tex0, vCoord0).xyz;\n    vec3 texToonColor = texture2D(texToon, vec2(0.5, 1.0 - normalDotLight)).xyz;\n    vec3 dstColor = texToonColor * tex0Color * (color * dlColor + ambient * ambColor + spcColor) ;\n\n    gl_FragColor = vec4(dstColor, 1.0);\n}',
    color0: '#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec3 color;\n\nvoid main() {\n    gl_FragColor = vec4(color, 1.0);\n}',
    bone0: '#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec4 vColor;\n\nvoid main() {\n    gl_FragColor = vColor;\n}'
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
  MMD_GL.Model = (function() {
    function Model() {
      this.buffers = {};
      this.mode = null;
      this.textures = {};
      this.textureUnits = {};
      this.program = null;
      if (arguments.length >= 2) {
        this.createBuffer(arguments[0], arguments[1], arguments[2], arguments[3]);
      }
    }
    Model.prototype.createBuffer = function(program, arrays, textures, opt_mode) {
      var texture, textureUnits, unit;
      this.setBuffers(arrays);
      textureUnits = {};
      unit = 0;
      for (texture in program.textures) {
        textureUnits[texture] = unit++;
      }
      this.mode = opt_mode === void 0 ? gl.TRIANGLES : opt_mode;
      this.textures = textures;
      this.textureUnits = textureUnits;
      this.setProgram(program);
      return this;
    };
    Model.prototype.setProgram = function(program) {
      this.program = program;
      return program;
    };
    Model.prototype.setBuffers = function(arrays) {
      var array, name;
      for (name in arrays) {
        array = arrays[name];
        this.setBuffer(name, array);
      }
      return arrays;
    };
    Model.prototype.setBuffer = function(name, array) {
      var b, target;
      target = name === 'indices' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
      b = this.buffers[name];
      if (!b) {
        b = new tdl.buffers.Buffer(array, target);
      } else {
        b.set(array);
      }
      this.buffers[name] = b;
      return b;
    };
    Model.prototype.applyUniforms_ = function(opt_uniforms) {
      var program, uniform;
      if (opt_uniforms) {
        program = this.program;
        for (uniform in opt_uniforms) {
          program.setUniform(uniform, opt_uniforms[uniform]);
        }
      }
    };
    Model.prototype.drawPrep = function() {
      var arg, attrib, b, buffer, buffers, program, textures, _i, _len, _results;
      program = this.program;
      buffers = this.buffers;
      textures = this.textures;
      program.use();
      for (buffer in buffers) {
        b = buffers[buffer];
        if (buffer === 'indices') {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.buffer());
        } else {
          attrib = program.attrib[buffer];
          if (attrib) {
            attrib(b);
          }
        }
      }
      this.applyUniforms_(textures);
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        _results.push(this.applyUniforms_(arg));
      }
      return _results;
    };
    Model.prototype.draw = function() {
      var arg, buffers, _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        this.applyUniforms_(arg);
      }
      buffers = this.buffers;
      return gl.drawElements(this.mode, buffers.indices.totalComponents(), gl.UNSIGNED_SHORT, 0);
    };
    return Model;
  })();
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
  MMD_GL.bones = (function() {
    var boneModel;
    boneModel = null;
    return {
      getBoneModel: function() {
        var colIndex, i, indices, position, program;
        if (boneModel != null) {
          return boneModel;
        }
        program = tdl.programs.loadProgram(MMD_GL.vertexShaderScript['bone0'], MMD_GL.fragmentShaderScript['bone0']);
        if (!(program != null)) {
          throw "*** Error compiling shader : " + tdl.programs.lastError;
        }
        position = new tdl.primitives.AttribBuffer(3, 4, 'Float32Array');
        indices = new tdl.primitives.AttribBuffer(1, 4, 'Uint16Array');
        colIndex = new tdl.primitives.AttribBuffer(1, 4, 'Float32Array');
        for (i = 0; i < 4; i++) {
          position.push([0, i, 0]);
          indices.push([i]);
          colIndex.push([i]);
        }
        return boneModel = new tdl.models.Model(program, {
          position: position,
          indices: indices,
          colIndex: colIndex
        }, null, gl.POINTS);
      }
    };
  })();
  MMD_GL.Bone = (function() {
    function Bone() {
      this.name = '';
      this.parentIndex = 0;
      this.tailIndex = 0;
      this.type = 0;
      this.parentIkIndex = 0;
      this.pos = new Float32Array([0.0, 0.0, 0.0]);
      this.offsetPos = null;
      this.invTransform = null;
      this.transform = null;
      this.localTransform = tdl.math.matrix4.identity();
    }
    Bone.prototype.clone = function() {
      var dst;
      dst = new MMD_GL.Bone;
      dst.name = this.name;
      dst.parentIndex = this.parentIndex;
      dst.tailIndex = this.tailIndex;
      dst.type = this.type;
      dst.parentIkIndex = this.parentIkIndex;
      dst.pos = new Float32Array(this.pos);
      dst.offsetPos = this.offsetPos != null ? new Float32Array(this.offsetPos) : null;
      dst.invTransform = this.invTransform != null ? new Float32Array(this.invTransform) : null;
      dst.transform = this.transform != null ? new Float32Array(this.transform) : null;
      dst.localTransform = this.localTransform != null ? new Float32Array(this.localTransform) : null;
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
      this.positions = null;
      this.transformedPositions = null;
      this.bones = null;
      this.boneFrameBuffer = null;
    }
    Mesh.prototype.transform = function() {
      var bone, boneIndex, boneModel, i, matInvPosition, _len, _ref2;
      this.updateAllBoneTransform();
      matInvPosition = tdl.fast.matrix4.identity(new Float32Array(16));
      boneModel = MMD_GL.bones.getBoneModel();
      this.boneFrameBuffer.bind();
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      boneModel.drawPrep();
      _ref2 = this.bones;
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        bone = _ref2[i];
        boneIndex = new Float32Array([i, 0.0]);
        boneModel.draw({
          boneIndex: boneIndex,
          boneMatrix: bone.transform
        });
        boneIndex[1] = 1.0;
        tdl.fast.matrix4.translation(matInvPosition, [-bone.pos[0], -bone.pos[1], -bone.pos[2]]);
        boneModel.draw({
          boneIndex: boneIndex,
          boneMatrix: matInvPosition
        });
      }
      this.boneFrameBuffer.unbind();
    };
    Mesh.prototype.updateAllBoneTransform = function() {
      var bone, _i, _len, _ref2;
      MMD_GL.debug.getNextFloat();
      this.bones[18].localTransform = new Float32Array(tdl.math.matrix4.rotationX(MMD_GL.debug.getCurrFloat() * 0.1));
      this.bones[48].localTransform = new Float32Array(tdl.math.matrix4.rotationX(MMD_GL.debug.getCurrFloat() * -0.1));
      _ref2 = this.bones;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        bone = _ref2[_i];
        this.updateBoneTransform(bone);
      }
      return this.bones;
    };
    Mesh.prototype.updateBoneTransform = function(bone) {
      var copyMat, mat, matOffset, mulMat, origBone, transMat;
      mulMat = tdl.fast.matrix4.mul;
      transMat = tdl.fast.matrix4.translation;
      copyMat = tdl.fast.copyMatrix;
      origBone = bone;
      mat = tdl.fast.matrix4.identity(new Float32Array(16));
      matOffset = tdl.fast.matrix4.identity(new Float32Array(16));
      while (bone.parentIndex !== 0xFFFF) {
        mulMat(mat, mat, bone.localTransform);
        transMat(matOffset, bone.offsetPos);
        mulMat(mat, mat, matOffset);
        bone = this.bones[bone.parentIndex];
      }
      mulMat(mat, mat, bone.localTransform);
      transMat(matOffset, bone.offsetPos);
      mulMat(mat, mat, matOffset);
      origBone.transform = mat;
      return origBone;
    };
    Mesh.prototype.draw = function(prep) {
      var i, model, _len, _ref2;
      _ref2 = this.models;
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        model = _ref2[i];
        model.drawPrep(prep);
        model.draw(this.materials[i]);
      }
    };
    Mesh.prototype.drawBone = function(world, view, projection) {
      var bone, boneDir, boneId, boneLength, bonePos, boneTailPos, coneModel, fast, math, midPos, sphereModel, world2, x, y, z, _i, _len, _len2, _ref2, _ref3;
      math = tdl.math;
      fast = tdl.fast;
      world2 = new Float32Array(world);
      coneModel = MMD_GL.getConeModel();
      sphereModel = MMD_GL.getSphereModel();
      coneModel.drawPrep();
      _ref2 = this.bones;
      for (boneId = 0, _len = _ref2.length; boneId < _len; boneId++) {
        bone = _ref2[boneId];
        if (bone.type === 6 || bone.type === 7) {
          continue;
        }
        bonePos = tdl.math.matrix4.transformVector4(bone.transform, [0, 0, 0, 1]);
        boneTailPos = math.addVector(bonePos, math.subVector(tdl.math.matrix4.transformVector4(this.bones[bone.tailIndex].transform, [0, 0, 0, 1]), bonePos));
        boneDir = math.subVector(boneTailPos, bonePos);
        boneLength = math.length(boneDir);
        midPos = math.mulVectorScalar(math.addVector(boneTailPos, bonePos), 0.5);
        y = math.normalize(boneDir);
        z = math.normalize(tdl.math.cross([0, 1, 0], y));
        if (math.lengthSquared(z) < 0.001) {
          z = [0, 0, 1];
        }
        x = math.normalize(math.cross(y, z));
        world2 = math.matrix4.copy(world);
        world2 = math.matrix4.mul(new Float32Array([x[0], x[1], x[2], 0, y[0] * boneLength, y[1] * boneLength, y[2] * boneLength, 0, z[0], z[1], z[2], 0, midPos[0], midPos[1], midPos[2], 1]), world2);
        coneModel.draw({
          color: new Float32Array([0.8, 0.0, 0.0]),
          world: world2,
          view: view,
          projection: projection
        });
      }
      sphereModel.drawPrep();
      _ref3 = this.bones;
      for (_i = 0, _len2 = _ref3.length; _i < _len2; _i++) {
        bone = _ref3[_i];
        world2 = tdl.math.matrix4.copy(world);
        world2 = tdl.math.matrix4.mul(bone.transform, world2);
        world2 = tdl.math.matrix4.mul(tdl.math.matrix4.scaling([0.5, 0.5, 0.5]), world2);
        sphereModel.draw({
          color: new Float32Array([0.8, 0.8, 0.8]),
          world: world2,
          view: view,
          projection: projection
        });
      }
    };
    return Mesh;
  })();
  MMD_GL.PMD = (function() {
    function PMD(bin) {
      var bone, buf, i, indexNum, indices, j, material, materialIndexNum, offset, texturePath, toonIndex, vertNum, _fn, _len, _len2, _ref2, _ref3, _ref4;
      if (MMD_GL.decodeSJIS(bin.readUint8(3)) !== 'Pmd') {
        throw 'bin is not pmd data';
      }
      this.version = (bin.readFloat32(1))[0];
      this.modelName = MMD_GL.decodeSJIS(bin.readUint8(20));
      this.comment = MMD_GL.decodeSJIS(bin.readUint8(256));
      vertNum = (bin.readUint32(1))[0];
      this.positions = new tdl.primitives.AttribBuffer(3, vertNum);
      this.normals = new tdl.primitives.AttribBuffer(3, vertNum);
      this.coord0s = new tdl.primitives.AttribBuffer(2, vertNum);
      this.boneIndices = new tdl.primitives.AttribBuffer(2, vertNum, 'Float32Array');
      this.boneWeights = new tdl.primitives.AttribBuffer(1, vertNum);
      this.edgeFlags = new tdl.primitives.AttribBuffer(1, vertNum, 'Array');
      for (i = 0; 0 <= vertNum ? i < vertNum : i > vertNum; 0 <= vertNum ? i++ : i--) {
        buf = bin.readFloat32(3);
        buf[2] = -buf[2];
        this.positions.push(buf);
        buf = bin.readFloat32(3);
        buf[2] = -buf[2];
        this.normals.push(buf);
        this.coord0s.push(bin.readFloat32(2));
        this.boneIndices.push(bin.readUint16(2));
        this.boneWeights.push([(bin.readUint8(1))[0] / 100.0]);
        this.edgeFlags.push([(bin.readUint8(1))[0] !== 0 ? true : false]);
      }
      indexNum = (bin.readUint32(1))[0];
      indices = bin.readUint16(indexNum);
      _fn = function(i) {
        var tmp;
        tmp = indices[i + 1];
        indices[i + 1] = indices[i + 2];
        return indices[i + 2] = tmp;
      };
      for (i = 0; i < indexNum; i += 3) {
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
        this.indices[i] = new tdl.primitives.AttribBuffer(3, this.indices[i], 'Uint16Array');
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
        bone.localTransform = null;
        this.bones[i] = bone;
      }
      _ref4 = this.bones;
      for (i = 0, _len2 = _ref4.length; i < _len2; i++) {
        bone = _ref4[i];
        bone.offsetPos = new Float32Array(tdl.math.subVector(bone.pos, bone.parentIndex !== 0xffff ? this.bones[bone.parentIndex].pos : [0.0, 0.0, 0.0]));
        bone.localTransform = tdl.math.matrix4.identity();
      }
      return;
    }
    PMD.prototype.createMesh = function() {
      var arrays, bone, boneIndices, boneWeights, coord0, i, mesh, model, normal, position, program, textures, _len, _ref2;
      program = tdl.programs.loadProgram(MMD_GL.vertexShaderScript['toon0'], MMD_GL.fragmentShaderScript['toon0']);
      if (!(program != null)) {
        throw "*** Error compiling shader : " + tdl.programs.lastError;
      }
      mesh = new MMD_GL.Mesh;
      mesh.bones = this.bones;
      mesh.boneWeights = this.boneWeights;
      mesh.boneIndices = this.boneIndices;
      mesh.positions = this.positions;
      mesh.normals = this.normals;
      mesh.coord0s = this.coord0s;
      mesh.boneFrameBuffer = new tdl.framebuffers.Float32Framebuffer(256, 256);
      mesh.transformedPositions = this.positions.clone();
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
      position = new tdl.buffers.Buffer(this.positions);
      normal = new tdl.buffers.Buffer(this.normals);
      coord0 = new tdl.buffers.Buffer(this.coord0s);
      boneWeights = new tdl.buffers.Buffer(this.boneWeights);
      boneIndices = new tdl.buffers.Buffer(this.boneIndices);
      mesh.models = new Array(this.materials.length);
      mesh.materials = new Array(this.materials.length);
      _ref2 = mesh.models;
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        model = _ref2[i];
        arrays = {
          indices: this.indices[i]
        };
        textures = {};
        textures.tex0 = this.materials[i].tex0;
        textures.texToon = this.materials[i].texToon;
        textures.texBone = mesh.boneFrameBuffer.texture;
        mesh.models[i] = new tdl.models.Model(program, arrays, textures);
        mesh.models[i].buffers.position = position;
        mesh.models[i].buffers.normal = normal;
        mesh.models[i].buffers.coord0 = coord0;
        mesh.models[i].buffers.boneWeights = boneWeights;
        mesh.models[i].buffers.boneIndices = boneIndices;
        mesh.materials[i] = this.materials[i].clone();
      }
      return mesh;
    };
    return PMD;
  })();
}).call(this);
