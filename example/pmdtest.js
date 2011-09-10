(function() {
  var Http, angle, canvas, coneModel, fpsTimer, gl, http, mainLoop, mesh, projection, render, view, viewProjection, world, worldViewProjection;
  Http = (function() {
    function Http() {}
    Http.prototype.getBinary = function(uri) {
      var deferred, xhr;
      deferred = new Deferred;
      xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            return deferred.call(xhr);
          } else {
            return deferred.fail(xhr);
          }
        }
      };
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
      deferred.canceller = function() {
        return xhr.abort;
      };
      xhr.open('GET', uri);
      xhr.send();
      return deferred;
    };
    return Http;
  })();
  http = new Http;
  tdl.require('tdl.buffers');
  tdl.require('tdl.fast');
  tdl.require('tdl.fps');
  tdl.require('tdl.log');
  tdl.require('tdl.math');
  tdl.require('tdl.fast');
  tdl.require('tdl.quaternions');
  tdl.require('tdl.models');
  tdl.require('tdl.primitives');
  tdl.require('tdl.programs');
  tdl.require('tdl.textures');
  tdl.require('tdl.framebuffers');
  tdl.require('tdl.screenshot');
  tdl.require('tdl.webgl');
  fpsTimer = null;
  canvas = null;
  gl = null;
  projection = new Float32Array(16);
  view = new Float32Array(16);
  world = new Float32Array(16);
  viewProjection = new Float32Array(16);
  worldViewProjection = new Float32Array(16);
  mesh = null;
  coneModel = null;
  angle = 0.0;
  mainLoop = function() {
    tdl.webgl.requestAnimationFrame(mainLoop, canvas);
    fpsTimer.now = (new Date).getTime() * 0.001;
    fpsTimer.elapsedTime = fpsTimer.then === 0.0 ? 0.0 : fpsTimer.now - fpsTimer.then;
    fpsTimer.then = fpsTimer.now;
    fpsTimer.update(fpsTimer.elapsedTime);
    fpsTimer.elem.innerHTML = "FPS&nbsp;" + fpsTimer.averageFPS;
    render();
  };
  render = function() {
    var prep;
    tdl.fast.matrix4.perspective(projection, tdl.math.degToRad(75), canvas.clientWidth / canvas.clientHeight, 1, 5000);
    tdl.fast.matrix4.lookAt(view, [0, 10, 20], [0, 10, 0], [0, 1, 0]);
    tdl.fast.matrix4.mul(viewProjection, view, projection);
    gl.depthMask(true);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    tdl.fast.matrix4.rotationY(world, angle);
    tdl.fast.matrix4.mul(worldViewProjection, world, viewProjection);
    prep = {
      world: world,
      worldViewProjection: worldViewProjection,
      dlColor: new Float32Array([1.0, 1.0, 1.0]),
      dlDirection: new Float32Array([0, 0, -1.0]),
      eyeVec: new Float32Array([0.0, 0.0, -1.0])
    };
    mesh.draw(prep);
    gl.disable(gl.DEPTH_TEST);
    mesh.drawBone(world, viewProjection);
    gl.enable(gl.DEPTH_TEST);
    angle += 0.02;
  };
  $(function() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    fpsTimer = new tdl.fps.FPSTimer;
    fpsTimer.now = 0.0;
    fpsTimer.then = 0.0;
    fpsTimer.elapsedTime = 0.0;
    fpsTimer.elem = document.getElementById('fps');
    gl = tdl.webgl.setupWebGL(canvas);
    document.body.appendChild(canvas);
    return Deferred.next(function() {
      return (http.getBinary('miku.pmd')).next(function(xhr) {
        var bin, pmd, program;
        bin = new MMD_GL.Binary(xhr.responseText);
        pmd = new MMD_GL.PMD(bin);
        mesh = pmd.createMesh();
        program = tdl.programs.loadProgram(MMD_GL.vertexShaderScript['color0'], MMD_GL.fragmentShaderScript['color0']);
        if (!(program != null)) {
          throw "*** Error compiling shader : " + tdl.programs.lastError;
        }
        return mainLoop();
      });
    }).next(function() {
      return console.log('next operation');
    }).error(function(e) {
      return alert(e);
    });
  });
}).call(this);
