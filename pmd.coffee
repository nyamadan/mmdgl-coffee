class MMD_GL.PMDMaterial
  constructor: ->
    @color = new Float32Array [0.0, 0.0, 0.0]

    @opacity = 0.0
    @shiness = 0.0
    @specular = new Float32Array [0.0, 0.0, 0.0]
    @ambient = new Float32Array [0.0, 0.0, 0.0]

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
    @bone0s = new Uint16Array vertNum
    @bone1s = new Uint16Array vertNum
    @boneWeights = new Float32Array vertNum
    @edgeFlags = new Uint8Array vertNum

    # read vertices
    for i in [0...vertNum]
      @positions[i * 3 + 0] = (bin.readFloat32 1)[0]
      @positions[i * 3 + 1] = (bin.readFloat32 1)[0]
      @positions[i * 3 + 2] = (-bin.readFloat32 1)[0]

      @normals[i * 3 + 0] = (bin.readFloat32 1)[0]
      @normals[i * 3 + 1] = (bin.readFloat32 1)[0]
      @normals[i * 3 + 2] = (-bin.readFloat32 1)[0]

      @coord0s[i * 2 + 0] = (bin.readFloat32 1)[0]
      @coord0s[i * 2 + 1] = (bin.readFloat32 1)[0]

      @bone0s[i] = (bin.readUint16 1)[0]
      @bone1s[i] = (bin.readUint16 1)[0]

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
        material.texToon = "toon0#{toonIndex + 1}.bmp"
      else if 99 > toonIndex >= 9
        material.texToon = "toon#{toonIndex + 1}.bmp"
      else
        material.texToon = null

      materialIndexNum = ~~ ((bin.readUint32 1)[0] * 1)
      texturePath = MMD_GL.decodeSJIS(bin.readUint8 20)
      @materials[i] = material

      # indices
      @indices[i] = new Uint16Array materialIndexNum
      for j in [0...materialIndexNum]
        @indices[i][j] = indices[offset + j]
      offset += materialIndexNum

  createMesh: ->
    program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['toon0'], MMD_GL.fragmentShaderScript['toon0']
    throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?
    
    model_array = new Array @materials.length
    model_array.bone0s = @bone0s
    model_array.bone1s = @bone1s

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

    for model, i in model_array
      indices     = new tdl.primitives.AttribBuffer 3, 0
      indices.buffer = @indices[i]
      indices.cursor = parseInt @indices[i].length / 3, 10
      indices.numComponents = 3
      indices.numElements = parseInt @indices[i].length / 3, 10
      indices.type = 'Uint16Array'
    model_array