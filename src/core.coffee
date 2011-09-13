window.MMD_GL ?= {}

MMD_GL.debug = do ->
  f = 0.0
  return {
    getCurrFloat: ->
      return f
    getNextFloat: ->
      f += 1.0
      return f
  }
