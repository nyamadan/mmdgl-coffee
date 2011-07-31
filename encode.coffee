MMD_GL.decodeSJIS = (charCodeArray) ->
  str = ''
  ch = ''

  for code in charCodeArray
    break if code == 0
    ch = (code.toString 16).toUpperCase();
    ch = '0' + ch while ch.length < 2
    str += '%' + ch
  UnescapeSJIS str
