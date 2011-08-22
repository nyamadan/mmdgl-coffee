(function() {
  var Http, angle, axis, canvas, circle, fpsTimer, gl, http, light, line, mainLoop, mesh, projection, render, view, viewProjection, world, worldViewProjection;
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
  light = null;
  axis = null;
  circle = null;
  line = null;
  angle = 0.0;
  mainLoop = function() {
    tdl.webgl.requestAnimationFrame(mainLoop, canvas);
    fpsTimer.now = (new Date).getTime() * 0.001;
    fpsTimer.elapsedTime = fpsTimer.then === 0.0 ? 0.0 : fpsTimer.now - fpsTimer.then;
    fpsTimer.then = fpsTimer.now;
    fpsTimer.update(fpsTimer.elapsedTime);
    fpsTimer.elem.innerHTML = "FPS&nbsp;" + fpsTimer.averageFPS;
    render();
    return 0;
  };
  render = function() {
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
    angle += 0.01;
    return 0;
  };
  /*
  //render the scenes
  var eyeVec = new Float32Array([0.0, 0.0, -1.0]);
  var render = function() {
      tdl.fast.matrix4.perspective(
          projection,
          tdl.math.degToRad(75),
          canvas.clientWidth / canvas.clientHeight,
          1,
          5000);
  
      tdl.fast.matrix4.lookAt(
          view,
          [0, 10, 20],
          [0, 10, 0],
          [0, 1, 0]);
  
      tdl.fast.matrix4.mul(viewProjection, view, projection);
  
      gl.depthMask(true);
      gl.clearColor(0, 0, 0, 1.0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
  
      tdl.fast.matrix4.rotationY(world, angle);
      tdl.fast.matrix4.mul(worldViewProjection, world, viewProjection);
      
      for(var i = 0; i < miku.length; i += 1){
          miku[i].model.drawPrep({
              'world': world,
              'worldViewProjection': worldViewProjection,
              'dlColor': light.uniforms.dlColor,
              'dlDirection': light.uniforms.dlDirection,
              'eyeVec': eyeVec,
          });
          miku[i].model.draw(miku[i].uniforms);
      }
  
      gl.disable(gl.DEPTH_TEST);
      for(var i = 0; i < axis.length; i += 1){
          axis[i].model.drawPrep({
              'worldViewProjection': worldViewProjection
          });
          axis[i].model.draw(axis[i].uniforms);
      }
      gl.enable(gl.DEPTH_TEST);
  
  
      tdl.fast.identity4(world);
      tdl.fast.matrix4.mul(worldViewProjection, world, viewProjection);
      gl.disable(gl.DEPTH_TEST);
      for(var i = 0; i < circle.length; i += 1){
          circle[i].model.drawPrep({
              'worldViewProjection': worldViewProjection
          });
          circle[i].model.draw(circle[i].uniforms);
      }
      gl.enable(gl.DEPTH_TEST);
  
      gl.disable(gl.DEPTH_TEST);
      for(var i = 0; i < line.length; i += 1){
          line[i].model.drawPrep({
              'worldViewProjection': worldViewProjection
          });
          line[i].model.draw(line[i].uniforms);
      }
      gl.enable(gl.DEPTH_TEST);
  
      gl.disable(gl.DEPTH_TEST);
      for(var i = 0; i < miku.bones.length; i += 1)
      {
          tdl.fast.matrix4.rotationY(world, angle);
          tdl.fast.matrix4.mul(world, miku.bones[i].world, world);
          tdl.fast.matrix4.mul(worldViewProjection, world, viewProjection);
          for(var j = 0; j < circle.length; j += 1){
              circle[j].model.drawPrep({
                  'worldViewProjection': worldViewProjection
              });
              circle[j].model.draw({color:[1.0, 0.0, 0.0]});
          }
      }
      gl.enable(gl.DEPTH_TEST);
  };
  
  //loop start
  $(function(){
      canvas = document.createElement('canvas');
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = "absolute";
      canvas.style.top =  "0px";
      canvas.style.left = "0px";
  
      fpsTimer = new tdl.fps.FPSTimer();
      fpsTimer.now = 0.0;
      fpsTimer.then = 0.0;
      fpsTimer.elapsedTime = 0.0;
      
      fpsTimer.elem = document.getElementById('fps');
  
      gl = tdl.webgl.setupWebGL(canvas);
      
      MMD_GL.initialize();
  
      getBinary('miku.pmd').next(function(blob){
          miku = (new MMD_GL.PMD(blob)).createTdlModel();
      }).next(function(){
          light = new MMD_GL.Light();
          
          axis = MMD_GL.primitives.createAxis(10.0);
          circle = MMD_GL.primitives.createCircle(0.25);
          line = MMD_GL.primitives.createLine([0.0, 0.0, 0.0], [0.0, -1.0, 1.0], [1.0, 0.0, 1.0]);
  
          document.body.appendChild(canvas);
  
          mainLoop();
      }).error(function(e){
          alert(e);
      });
  });
  */
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
        var bin, pmd;
        bin = new MMD_GL.Binary(xhr.responseText);
        pmd = new MMD_GL.PMD(bin);
        mesh = pmd.createMesh();
        return mainLoop();
      });
    }).next(function() {
      return console.log('next operation');
    }).error(function(e) {
      return alert(e);
    });
  });
}).call(this);
