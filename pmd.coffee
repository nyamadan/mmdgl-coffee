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
    @position = new Float32Array vertNum * 3
    @normals = new Float32Array vertNum * 3
    @coord0s = new Float32Array vertNum * 2
    @bone0s = new Uint16Array vertNum
    @bone1s = new Uint16Array vertNum
    @boneWeights = new Float32Array vertNum
    @edgeFlags = new Uint8Array vertNum

    # read vertices
    for i in [0...vertNum]
      @position[i * 3 + 0] = (bin.readFloat32 1)[0]
      @position[i * 3 + 1] = (bin.readFloat32 1)[0]
      @position[i * 3 + 2] = (-bin.readFloat32 1)[0]

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
