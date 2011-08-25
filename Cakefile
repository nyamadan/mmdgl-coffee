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
 
build = (outputfile, sources, watch = false) ->
  arg = ['--compile', '--join'].concat(outputfile).concat(sources)

  compile = -> 
    coffee = spawn 'coffee', arg
    coffee.stdout.on 'data', (data) ->
      console.log data
    coffee.stderr.on 'data', (data) ->
      console.log data

  console.log "#{(new Date).toLocaleTimeString()} - compiled #{outputfile}"
  compile()

  if watch
    for source in sources
      fs.watchFile source, {persistent: true, interval: 500}, (curr, prev) ->
        return if curr.mtime.getTime() is prev.mtime.getTime()
        console.log "#{(new Date).toLocaleTimeString()} - compiled #{outputfile} (#{sources})"
        compile()
  return

task "build", "build all", (options) ->
  build dstLib, srcLib, options.watch?
  build dstBinTest, srcBinTest, options.watch?
  build dstPmdTest, srcPmdTest, options.watch?
  return

task "build:lib", "build lib", (options) ->
  build dstLib, srcLib, options.watch?
  return

task "build:bintest", "build bintest", (options) ->
  build dstBinTest, srcBinTest, options.watch?
  return

task "build:pmdtest", "build pmdtest", (options) ->
  build dstPmdTest, srcPmdTest, options.watch?
  return
