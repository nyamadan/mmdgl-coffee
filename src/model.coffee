class MMD_GL.Model
  constructor:->
    @buffers = {}
    @mode = null
    @textures = {}
    @textureUnits = {}
    @program = null
    if arguments.length >= 2
      @createBuffer arguments[0], arguments[1], arguments[2], arguments[3]

  createBuffer: (program, arrays, textures, opt_mode) ->
    @setBuffers arrays

    textureUnits = {}
    unit = 0
    for texture of program.textures
      textureUnits[texture] = unit++

    @mode = if opt_mode == undefined then gl.TRIANGLES else opt_mode
    @textures = textures
    @textureUnits = textureUnits
    @setProgram program
    return this

  setProgram: (program) ->
    @program = program
    return program

  setBuffers: (arrays) ->
    @setBuffer name, array for name, array of arrays
    return arrays

  setBuffer: (name, array) ->
    target = if name == 'indices' then gl.ELEMENT_ARRAY_BUFFER else gl.ARRAY_BUFFER
    b = @buffers[name]
    if !b
      b = new tdl.buffers.Buffer array, target
    else
      b.set array
    @buffers[name] = b
    return b

  applyUniforms_: (opt_uniforms) ->
    if opt_uniforms
      program = @program
      for uniform of opt_uniforms
        program.setUniform uniform, opt_uniforms[uniform]
    return

  drawPrep: ->
    program = @program
    buffers = @buffers
    textures = @textures

    program.use()

    for buffer of buffers
      b = buffers[buffer]
      if buffer == 'indices'
        gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, b.buffer()
      else
        attrib = program.attrib[buffer]
        attrib(b) if attrib

    @applyUniforms_ textures
    @applyUniforms_ arg for arg in arguments

  draw: ->
    @applyUniforms_ arg for arg in arguments
    buffers = @buffers
    gl.drawElements @mode, buffers.indices.totalComponents(), gl.UNSIGNED_SHORT, 0

