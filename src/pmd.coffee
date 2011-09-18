class MMD_GL.PMDMaterial
  constructor: ->
    @color = new Float32Array [0.0, 0.0, 0.0]

    @opacity = 0.0
    @shiness = 0.0
    @specular = new Float32Array [0.0, 0.0, 0.0]
    @ambient = new Float32Array [0.0, 0.0, 0.0]
    @edgeFlag = false

  clone: ->
    dst = new MMD_GL.PMDMaterial
    dst.color = new Float32Array @color
    dst.opacity = @opacity
    dst.shiness = @shiness
    dst.specular = new Float32Array @specular
    dst.ambient = new Float32Array @ambient
    dst.edgeFlag = @edgeFlag
    dst

MMD_GL.bones = do ->
  boneModel = null

  return {
    getBoneModel: ->
      return boneModel if boneModel?

      program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['bone0'], MMD_GL.fragmentShaderScript['bone0']
      throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?

      position = new tdl.primitives.AttribBuffer 3, 4, 'Float32Array'
      indices = new tdl.primitives.AttribBuffer 1, 4, 'Uint16Array'

      colIndex = new tdl.primitives.AttribBuffer 1, 4, 'Float32Array'
      
      for i in [0...4]
        position.push [0, i, 0]
        indices.push [i]
        colIndex.push [i]
      boneModel = new tdl.models.Model program, {position:position, indices:indices, colIndex:colIndex}, null, gl.POINTS
  }

class MMD_GL.Bone
  constructor: ->
    @name = ''
    @parentIndex = 0
    @tailIndex = 0
    @type = 0
    @parentIkIndex = 0
    @pos = new Float32Array [0.0, 0.0, 0.0]
    @offsetPos = null
    @invTransform = null
    @transform = null
    @localTransform = tdl.math.matrix4.identity()

  clone: ->
    dst = new MMD_GL.Bone
    dst.name = @name
    dst.parentIndex = @parentIndex
    dst.tailIndex = @tailIndex
    dst.type = @type
    dst.parentIkIndex = @parentIkIndex
    dst.pos = new Float32Array @pos
    dst.offsetPos = if @offsetPos? then new Float32Array @offsetPos else null
    dst.invTransform = if @invTransform? then new Float32Array @invTransform else null
    dst.transform = if @transform? then new Float32Array @transform else null
    dst.localTransform = if @localTransform? then new Float32Array @localTransform else null
    dst

class MMD_GL.Mesh
  constructor: ->
    @bones = []
    @boneIndices = []
    @boneWeights = []
    @models = []
    @materials = []

    @positions = null
    @transformedPositions = null

    @bones = null
    @boneFrameBuffer = null

  transform: ->
    @updateAllBoneTransform()

    matInvPosition = tdl.fast.matrix4.identity(new Float32Array 16)

    # bone frame buffer
    boneModel = MMD_GL.bones.getBoneModel()

    # write out bones
    @boneFrameBuffer.bind()
    gl.clearColor 0.0, 0.0, 0.0, 1.0
    gl.clear gl.COLOR_BUFFER_BIT
    boneModel.drawPrep()
    for bone, i in @bones
      boneIndex = new Float32Array [i, 0.0]
      boneModel.draw {boneIndex:boneIndex, boneMatrix:bone.transform}

      boneIndex[1] = 1.0
      tdl.fast.matrix4.translation matInvPosition, [-bone.pos[0], -bone.pos[1], -bone.pos[2]]
      boneModel.draw {boneIndex:boneIndex, boneMatrix:matInvPosition}

    @boneFrameBuffer.unbind()

    return

  updateAllBoneTransform: () ->
    # Debug : transform bones
    MMD_GL.debug.getNextFloat()
    @bones[18].localTransform = new Float32Array(tdl.math.matrix4.rotationX MMD_GL.debug.getCurrFloat() * 0.1)
    @bones[48].localTransform = new Float32Array(tdl.math.matrix4.rotationX MMD_GL.debug.getCurrFloat() * -0.1)

    @updateBoneTransform bone for bone in @bones
    return @bones

  updateBoneTransform: (bone) ->
    mulMat = tdl.fast.matrix4.mul
    transMat = tdl.fast.matrix4.translation
    copyMat = tdl.fast.copyMatrix

    origBone = bone

    mat = tdl.fast.matrix4.identity(new Float32Array 16)
    matOffset = tdl.fast.matrix4.identity(new Float32Array 16)

    while bone.parentIndex isnt 0xFFFF
      mulMat mat, mat, bone.localTransform
      transMat matOffset, bone.offsetPos
      mulMat mat, mat, matOffset
      bone = @bones[bone.parentIndex]

    mulMat mat, mat, bone.localTransform
    transMat matOffset, bone.offsetPos
    mulMat mat, mat, matOffset

    origBone.transform = mat
    # origBone.invTransform = tdl.fast.matrix4.inverse new Float32Array(16), mat
    return origBone

  draw: (prep) ->
    for model, i in @models
      model.drawPrep prep
      model.draw @materials[i]
    return

  drawBone: (world, view, projection) ->
    math = tdl.math
    fast = tdl.fast
 
    world2 = new Float32Array world

    coneModel = MMD_GL.getConeModel()
    sphereModel = MMD_GL.getSphereModel()

    coneModel.drawPrep()
    for bone, boneId in @bones
      continue if bone.type == 6 or bone.type == 7
      # debug info : boneId 18 is armL

      bonePos = tdl.math.matrix4.transformVector4(bone.transform, [0, 0, 0, 1])
      boneTailPos = math.addVector bonePos, math.subVector(tdl.math.matrix4.transformVector4(@bones[bone.tailIndex].transform, [0, 0, 0, 1]), bonePos)

      boneDir = math.subVector boneTailPos, bonePos
      boneLength = math.length boneDir
      midPos = math.mulVectorScalar math.addVector(boneTailPos, bonePos), 0.5

      y = math.normalize boneDir
      z = math.normalize tdl.math.cross([0, 1, 0], y)
      if math.lengthSquared(z) < 0.001
        z = [0, 0, 1]
      x = math.normalize math.cross(y, z)

      world2 = math.matrix4.copy world
      world2 = math.matrix4.mul (new Float32Array [
          x[0], x[1], x[2], 0
          y[0] * boneLength, y[1] * boneLength, y[2] * boneLength, 0
          z[0], z[1], z[2], 0
          midPos[0], midPos[1], midPos[2], 1
        ]),
        world2


      coneModel.draw {
        color : new Float32Array [0.8, 0.0, 0.0]
        world : world2
        view : view
        projection : projection
      }

    sphereModel.drawPrep()
    for bone in @bones
      world2 = tdl.math.matrix4.copy world
      world2 = tdl.math.matrix4.mul bone.transform, world2
      world2 = tdl.math.matrix4.mul tdl.math.matrix4.scaling([0.5, 0.5, 0.5]), world2

      sphereModel.draw {
        color : new Float32Array [0.8, 0.8, 0.8]
        world : world2
        view : view
        projection : projection 
      }
    return

class MMD_GL.PMD
  constructor: (bin) ->
    # magic 'Pmd'
    throw 'bin is not pmd data' if MMD_GL.decodeSJIS(bin.readUint8 3) != 'Pmd'

    # version
    @version = (bin.readFloat32 1)[0]

    # model name
    @modelName = MMD_GL.decodeSJIS(bin.readUint8 20)

    # comment
    @comment = MMD_GL.decodeSJIS(bin.readUint8 256)

    # read vertices num 
    vertNum = (bin.readUint32 1)[0]

    # allocate vertices
    @positions = new tdl.primitives.AttribBuffer 3, vertNum
    @normals = new tdl.primitives.AttribBuffer 3, vertNum
    @coord0s = new tdl.primitives.AttribBuffer 2, vertNum
    @boneIndices = new tdl.primitives.AttribBuffer 2, vertNum, 'Float32Array'
    @boneWeights = new tdl.primitives.AttribBuffer 1, vertNum
    @edgeFlags = new tdl.primitives.AttribBuffer 1, vertNum, 'Array'

    # read vertices
    for i in [0...vertNum]
      buf = (bin.readFloat32 3)
      buf[2] = -buf[2]
      @positions.push buf

      buf = (bin.readFloat32 3)
      buf[2] = -buf[2]
      @normals.push buf

      @coord0s.push (bin.readFloat32 2)

      @boneIndices.push (bin.readUint16 2)
      @boneWeights.push [(bin.readUint8 1)[0] / 100.0]
      @edgeFlags.push [if (bin.readUint8 1)[0] != 0 then true else false]
    
    # read number of index ((number of face) * 3)
    indexNum = (bin.readUint32 1)[0]
    indices = (bin.readUint16 indexNum)
    # Inverce Face
    for i in [0...indexNum] by 3
      do (i) ->
        tmp = indices[i + 1]
        indices[i + 1] = indices[i + 2]
        indices[i + 2] = tmp

    # read materials
    @materials = new Array (bin.readUint32 1)[0]
    @indices = new Array @materials.length

    texturePath = ''
    toonIndex = null
    # indices offset
    offset = 0
    
    # load materials
    for i in [0...@materials.length]
      material = new MMD_GL.PMDMaterial
      material.color = (bin.readFloat32 3)

      material.opacity = (bin.readFloat32 1)[0]
      material.shiness = (bin.readFloat32 1)[0]
      material.specular = (bin.readFloat32 3)
      material.ambient = (bin.readFloat32 3)

      toonIndex = (bin.readUint8 1)[0]
      material.edgeFlag = if (bin.readUint8 1)[0] then true else false

      if 9 > toonIndex >= 0
        material.texToon = tdl.textures.loadTexture "toon0#{toonIndex + 1}.bmp"
      else if 99 > toonIndex >= 9
        material.texToon = tdl.textures.loadTexture "toon#{toonIndex + 1}.bmp"
      else
        material.texToon = MMD_GL.getWhitePixelTexture()

      materialIndexNum = parseInt (bin.readUint32 1)[0], 10
      texturePath = MMD_GL.decodeSJIS(bin.readUint8 20)
      material.tex0 = if texturePath.length > 0 then tdl.textures.loadTexture texturePath else MMD_GL.getWhitePixelTexture()
      @materials[i] = material

      # indices
      @indices[i] = new Uint16Array materialIndexNum
      for j in [0...materialIndexNum]
        @indices[i][j] = indices[offset + j]
      @indices[i] = new tdl.primitives.AttribBuffer 3, @indices[i], 'Uint16Array'
      offset += materialIndexNum
    # end of material loop

    @bones = new Array (bin.readUint16 1)[0]
    
    for bone, i in @bones
      bone = new MMD_GL.Bone
      bone.name = MMD_GL.decodeSJIS(bin.readUint8 20)
      bone.parentIndex = (bin.readUint16 1)[0]
      bone.tailIndex = (bin.readUint16 1)[0]
      bone.type = (bin.readUint8 1)[0]
      bone.parentIkIndex = (bin.readUint16 1)[0]
      bone.pos = (bin.readFloat32 3)
      bone.pos[2] = -bone.pos[2]

      bone.localTransform = null
      @bones[i] = bone

    for bone, i in @bones
      bone.offsetPos = new Float32Array tdl.math.subVector bone.pos, if bone.parentIndex isnt 0xffff then @bones[bone.parentIndex].pos else [0.0, 0.0, 0.0]
      bone.localTransform = tdl.math.matrix4.identity()
    return

  createMesh: ->
    program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['toon0'], MMD_GL.fragmentShaderScript['toon0']
    throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?
    
    mesh = new MMD_GL.Mesh

    # give references
    mesh.bones = @bones
    mesh.boneWeights = @boneWeights
    mesh.boneIndices = @boneIndices
    mesh.positions = @positions
    mesh.normals = @normals
    mesh.coord0s = @coord0s

    mesh.boneFrameBuffer = new tdl.framebuffers.Float32Framebuffer 256,256

    # clone of positions and bones
    mesh.transformedPositions = @positions.clone()
    mesh.bones = ( bone.clone() for bone in @bones)

    # create webgl buffers
    position = new tdl.buffers.Buffer @positions
    normal = new tdl.buffers.Buffer @normals
    coord0 = new tdl.buffers.Buffer @coord0s
    boneWeights = new tdl.buffers.Buffer @boneWeights
    boneIndices = new tdl.buffers.Buffer @boneIndices

    mesh.models = new Array @materials.length
    mesh.materials = new Array @materials.length
    for model, i in mesh.models
      arrays =
        indices   : @indices[i]
      textures = {}
      textures.tex0 = @materials[i].tex0
      textures.texToon = @materials[i].texToon
      textures.texBone = mesh.boneFrameBuffer.texture

      mesh.models[i] = new tdl.models.Model program, arrays, textures
      mesh.models[i].buffers.position = position
      mesh.models[i].buffers.normal = normal
      mesh.models[i].buffers.coord0 = coord0
      mesh.models[i].buffers.boneWeights = boneWeights
      mesh.models[i].buffers.boneIndices = boneIndices

      mesh.materials[i] = @materials[i].clone()
    mesh
