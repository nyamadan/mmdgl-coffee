class Http
  constructor: ->
    
  getBinary: (uri) ->
    deferred = new Deferred
    xhr = new XMLHttpRequest
    xhr.onreadystatechange = ->
      if xhr.readyState == 4
        if xhr.status == 200
          deferred.call xhr
        else
          deferred.fail xhr
    xhr.overrideMimeType 'text/plain; charset=x-user-defined'

    deferred.canceller = -> 
      xhr.abort

    xhr.open 'GET', uri
    xhr.send()

    deferred

http = new Http

tdl.require 'tdl.buffers'
tdl.require 'tdl.fast'
tdl.require 'tdl.fps'
tdl.require 'tdl.log'
tdl.require 'tdl.math'
tdl.require 'tdl.models'
tdl.require 'tdl.primitives'
tdl.require 'tdl.programs'
tdl.require 'tdl.textures'
tdl.require 'tdl.framebuffers'
tdl.require 'tdl.screenshot'
tdl.require 'tdl.webgl'

fpsTimer = null
canvas = null
gl = null

projection = new Float32Array 16
view = new Float32Array 16
world = new Float32Array 16
viewProjection = new Float32Array 16
worldViewProjection = new Float32Array 16

mesh = null

light = null
axis = null
circle = null
line = null


angle = 0.0

# main loop function.
mainLoop = () ->
  tdl.webgl.requestAnimationFrame mainLoop, canvas

  # Update fps.
  fpsTimer.now = (new Date ).getTime() * 0.001
  fpsTimer.elapsedTime = if fpsTimer.then == 0.0 then 0.0 else fpsTimer.now - fpsTimer.then
  fpsTimer.then = fpsTimer.now

  fpsTimer.update fpsTimer.elapsedTime
  fpsTimer.elem.innerHTML = "FPS&nbsp;#{fpsTimer.averageFPS}"

  render();
  return

# render function
render = ->
  # Calcurate matrix
  tdl.fast.matrix4.perspective projection,
    (tdl.math.degToRad 75),
    canvas.clientWidth / canvas.clientHeight,
    1,
    5000

  tdl.fast.matrix4.lookAt view,
    [0, 10, 20],
    [0, 10, 0],
    [0, 1, 0]

  tdl.fast.matrix4.mul viewProjection, view, projection

  # Start GL
  gl.depthMask true
  gl.clearColor 0, 0, 0, 1.0
  gl.clearDepth 1
  gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT

  gl.enable gl.CULL_FACE
  gl.enable gl.DEPTH_TEST
  
  tdl.fast.matrix4.rotationY world, angle
  tdl.fast.matrix4.mul worldViewProjection, world, viewProjection

  prep = 
    world               : world
    worldViewProjection : worldViewProjection
    dlColor             : new Float32Array [1.0, 1.0, 1.0]
    dlDirection         : new Float32Array [0, 0, -1.0]
    eyeVec              : new Float32Array [0.0, 0.0, -1.0]

  for model, i in mesh.models
    material = mesh.materials[i]
    model.drawPrep prep
    model.draw material

  angle += 0.01;
  return

# Bootstrap
$ ->
  # Create canvas element
  canvas = document.createElement 'canvas'

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'absolute'
  canvas.style.top = '0px'
  canvas.style.left = '0px'

  fpsTimer = new tdl.fps.FPSTimer
  fpsTimer.now = 0.0
  fpsTimer.then = 0.0
  fpsTimer.elapsedTime = 0.0

  fpsTimer.elem = document.getElementById 'fps'

  # Initialize GL
  gl = tdl.webgl.setupWebGL canvas
  
  # Add element to document
  document.body.appendChild canvas

  # Wait for load materials
  Deferred.next ->
    (http.getBinary 'miku.pmd').next (xhr) ->
      bin = new MMD_GL.Binary xhr.responseText
      pmd = new MMD_GL.PMD bin
      mesh = pmd.createMesh()
      mainLoop()
  .next ->
    console.log 'next operation'
  .error (e) ->
    alert e
