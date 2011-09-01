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
class MMD_GL.Bone
  constructor: ->
    @name = ''
    @parentIndex = 0
    @tailIndex = 0
    @type = 0
    @parentIkIndex = 0
    @pos = new Float32Array [0.0, 0.0, 0.0]
  clone: ->
    dst = new MMD_GL.Bone
    dst.name = @name
    dst.parentIndex = @parentIndex
    dst.tailIndex = @tailIndex
    dst.type = @type
    dst.parentIkIndex = @parentIkIndex
    dst.pos = @pos
    dst

class MMD_GL.Mesh
  constructor: ->
    @bones = []
    @boneIndices = []
    @boneWeights = []
    @models = []
    @materials = []

  draw: (prep) ->
    for model, i in @models
      model.drawPrep prep
      model.draw @materials[i]
    return

  drawBone: (world, viewProjection) ->
    world2 = new Float32Array world
    worldViewProjection = new Float32Array 16

    coneModel = MMD_GL.getConeModel()

    coneModel.drawPrep()
    for bone in @bones
      y = tdl.math.normalize bone.pos
      z = tdl.math.normalize tdl.math.cross([0, 1, 0], y)
      if tdl.math.lengthSquared(z) < 0.001
        z = [0, 0, 1]
      x = tdl.math.normalize tdl.math.cross(y, z)

      tdl.fast.matrix4.mul world2,
        (new Float32Array [
          x[0], x[1], x[2], 0 
          y[0], y[1], y[2], 0
          z[0], z[1], z[2], 0
          bone.pos[0], bone.pos[1], bone.pos[2], 1
        ]), 
        world

      tdl.fast.matrix4.mul worldViewProjection, world2, viewProjection

      coneModel.draw {
        color : new Float32Array [0.8, 0.8, 0.8]
        worldViewProjection : worldViewProjection
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
    @positions = new Float32Array vertNum * 3
    @normals = new Float32Array vertNum * 3
    @coord0s = new Float32Array vertNum * 2
    @boneIndices = new Array vertNum
    @boneWeights = new Float32Array vertNum
    @edgeFlags = new Uint8Array vertNum

    # read vertices
    for i in [0...vertNum]
      @positions[i * 3 + 0] = (bin.readFloat32 1)[0]
      @positions[i * 3 + 1] = (bin.readFloat32 1)[0]
      @positions[i * 3 + 2] = -(bin.readFloat32 1)[0]

      @normals[i * 3 + 0] = (bin.readFloat32 1)[0]
      @normals[i * 3 + 1] = (bin.readFloat32 1)[0]
      @normals[i * 3 + 2] = -(bin.readFloat32 1)[0]

      @coord0s[i * 2 + 0] = (bin.readFloat32 1)[0]
      @coord0s[i * 2 + 1] = (bin.readFloat32 1)[0]

      @boneIndices[i] = (bin.readUint16 2)

      @boneWeights[i] = (bin.readUint8 1)[0] / 100.0
      @edgeFlags[i] = if (bin.readUint8 1)[0] then true else false

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
    @indices = new Array this.materials.length

    texturePath = ''
    toonIndex = null;
    
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
      offset += materialIndexNum

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
      @bones[i] = bone
    return

  createMesh: ->
    program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['toon0'], MMD_GL.fragmentShaderScript['toon0']
    throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?
    
    mesh = new MMD_GL.Mesh
    mesh.boneWeights = new Float32Array @boneWeights
    mesh.boneIndices = ( new Uint16Array boneIndex for boneIndex in @boneIndices )
    
    mesh.bones = ( bone.clone() for bone in @bones)
 
    position    = new tdl.primitives.AttribBuffer 3, @positions
    normal      = new tdl.primitives.AttribBuffer 3, @normals
    coord0      = new tdl.primitives.AttribBuffer 2, @coord0s

    mesh.models = new Array @materials.length
    mesh.materials = new Array @materials.length
    for model, i in mesh.models
      indices     = new tdl.primitives.AttribBuffer 3, @indices[i], 'Uint16Array'
      
      arrays = 
        indices   : indices
        position  : position
        normal    : normal
        coord0    : coord0
      
      textures = {}
      textures.tex0 = @materials[i].tex0 if @materials[i].tex0?
      textures.texToon = @materials[i].texToon if @materials[i].texToon?

      mesh.models[i] = new tdl.models.Model program, arrays, textures
      mesh.materials[i] = @materials[i].clone()
    mesh