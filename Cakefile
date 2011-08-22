sys = require 'sys'
fs = require 'fs'

{spawn} = require('child_process')

option '-w', '--watch', 'watch script for changes, and recompile'

srcLib = [
  'core.coffee'
  'shader.coffee'
  'binary.coffee'
  'encode.coffee'
  'pmd.coffee'
]
dstLib = 'mmdgl.js'

srcBinTest = [
  'bintest.coffee'
]
dstBinTest = 'bintest.js'

srcPmdTest = [
  'pmdtest.coffee'
]
dstPmdTest = 'pmdtest.js'

build = (dst, src, watch = false) ->
  arg = ['-j'].concat(dst).concat('-c').concat(src)

  run = -> 
    coffee = spawn 'coffee', arg
    coffee.stdout.on 'data', (data) ->
      sys.puts data
    coffee.stderr.on 'data', (data) ->
      sys.puts data

  sys.puts "compile : #{dst}"
  run()

  if watch
    for s in src
      fs.watchFile s, (curr, prev) ->
        sys.puts "compile : #{dst} @ #{curr.ctime}"
        run() if curr.mtime != prev.mtime
  0

task "build", "build all", (options) ->
  build dstLib, srcLib, options.watch?
  build dstBinTest, srcBinTest, options.watch?
  build dstPmdTest, srcPmdTest, options.watch?
  0

task "build:lib", "build lib", (options) ->
  build dstLib, srcLib, options.watch?
  0

task "build:bintest", "build bintest", (options) ->
  build dstBinTest, srcBinTest, options.watch?
  0

task "build:pmdtest", "build pmdtest", (options) ->
  build dstPmdTest, srcPmdTest, options.watch?
  0
