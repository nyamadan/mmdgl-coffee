express = require 'express'
express = express.createServer(
  express.favicon(),
  express.logger(),
  express.static(__dirname)
)
express.listen 3000
