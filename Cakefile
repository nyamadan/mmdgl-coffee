sys = require 'sys'
fs = require 'fs'

{spawn} = require('child_process')

option '-w', '--watch', 'watch script for changes, and recompile'

srcLib = ['core.coffee', 'binary.coffee', 'encode.coffee', 'pmd.coffee']
dstLib = 'mmdgl.js'

srcBinTest = ['bintest.coffee']
dstBinTest = 'bintest.js'

srcPmdTest = ['pmdtest.coffee']
dstPmdTest = 'pmdtest.js'

build = (dst, src, watch = false) ->
  arg = ['-j'].concat(dst).concat('-c').concat(src)
  if watch
    for s in src
      fs.watchFile s, (curr, prev) ->
        sys.puts "compile : #{dst} @ #{curr.mtime}"
        spawn 'coffee', arg if prev.mtime != curr.mtime
  else
    sys.puts "compile : #{dst}"
    spawn 'coffee', arg
  0

task "build", "build all", (options) ->
  build dstLib, srcLib, options.watch?
  build dstBinTest, srcBinTest, options.watch?
  build dstPmdTest, srcPmdTest, options.watch?

task "build:lib", "build lib", (options) ->
  build dstLib, srcLib, options.watch?

task "build:bintest", "build bintest", (options) ->
  build dstBinTest, srcBinTest, options.watch?

task "build:pmdtest", "build pmdtest", (options) ->
  build dstPmdTest, srcPmdTest, options.watch?
