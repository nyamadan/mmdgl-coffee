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

class MMD_GL.Mesh
  constructor: ->
    @boneIndices = []
    @boneWeights = []
    @models = []
    @materials = []

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

      materialIndexNum = ~~ ((bin.readUint32 1)[0] * 1)
      texturePath = MMD_GL.decodeSJIS(bin.readUint8 20)
      material.tex0 = if texturePath.length > 0 then tdl.textures.loadTexture texturePath else MMD_GL.getWhitePixelTexture()
      @materials[i] = material

      # indices
      @indices[i] = new Uint16Array materialIndexNum
      for j in [0...materialIndexNum]
        @indices[i][j] = indices[offset + j]
      offset += materialIndexNum

  createMesh: ->
    program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['toon0'], MMD_GL.fragmentShaderScript['toon0']
    throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?
    
    mesh = new MMD_GL.Mesh
    mesh.boneWeights = new Float32Array @boneWeights
    mesh.boneIndices = ( new Uint16Array boneIndex for boneIndex in @boneIndices )

    position    = new tdl.primitives.AttribBuffer 3, 0
    normal      = new tdl.primitives.AttribBuffer 3, 0
    coord0      = new tdl.primitives.AttribBuffer 2, 0

    position.buffer = @positions
    position.cursor = parseInt @positions.length / 3, 10
    position.numComponents = 3
    position.numElements = parseInt @positions.length / 3, 10
    position.type = 'Float32Array'

    normal.buffer = @normals
    normal.cursor = parseInt @normals.length / 3, 10
    normal.numComponents = 3
    normal.numElements = parseInt @normals.length / 3, 10
    normal.type = 'Float32Array'

    coord0.buffer = @coord0s
    coord0.cursor = parseInt @coord0s.length / 2, 10
    coord0.numComponents = 2
    coord0.numElements = parseInt @coord0s.length / 2, 10
    coord0.type = 'Float32Array'

    mesh.models = new Array @materials.length
    mesh.materials = new Array @materials.length
    for model, i in mesh.models
      indices     = new tdl.primitives.AttribBuffer 3, 0
      indices.buffer = @indices[i]
      indices.cursor = parseInt @indices[i].length / 3, 10
      indices.numComponents = 3
      indices.numElements = parseInt @indices[i].length / 3, 10
      indices.type = 'Uint16Array'
      
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