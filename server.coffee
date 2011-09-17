express = require 'express'
server = express.createServer(
  express.favicon(),
  express.logger(),
  express.static(__dirname)
)
server.listen 3000
