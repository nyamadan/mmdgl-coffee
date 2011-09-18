MMD_GL.getWhitePixelTexture = do ->
  texture = null
  ->
    if texture? then texture else texture = new tdl.textures.SolidTexture [255, 255, 255, 255]

MMD_GL.getConeModel = do ->
  model = null
  ->
    if model?
      model
    else
      program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['color0'], MMD_GL.fragmentShaderScript['color0']
      throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?
      model = new tdl.models.Model program, new tdl.primitives.createTruncatedCone(0.25, 0.0, 1.0, 3, 1)

MMD_GL.getSphereModel = do ->
  model = null
  ->
    if model?
      model
    else
      program = tdl.programs.loadProgram MMD_GL.vertexShaderScript['color0'], MMD_GL.fragmentShaderScript['color0']
      throw "*** Error compiling shader : #{tdl.programs.lastError}" if not program?
      model = new tdl.models.Model program, new tdl.primitives.createSphere(0.5, 8, 8)

MMD_GL.vertexShaderScript =
  toon0:
    '''
    uniform mat4 world;
    uniform mat4 view;
    uniform mat4 projection;

    uniform sampler2D texBone;
    
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 coord0;

    attribute vec2 boneIndices;
    attribute float boneWeights;

    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vCoord0;
    
    void main() {
        vec4 v0; vec4 v1; vec4 v2; vec4 v3;
        float halfSize = 1.0 / 512.0;
        vec2 bone0 = vec2(boneIndices.x, 0.0);
        vec2 bone1 = vec2(boneIndices.y, 0.0);
        bone0.x = (bone0.x * 2.0 + 1.0) * halfSize;
        bone1.x = (bone1.x * 2.0 + 1.0) * halfSize;
        bone0.y = (bone0.y * 8.0 + 1.0) * halfSize;
        bone1.y = (bone1.y * 8.0 + 1.0) * halfSize;
        v0 = texture2D(texBone, vec2(bone0.x, bone0.y + 0.0 * halfSize));
        v1 = texture2D(texBone, vec2(bone0.x, bone0.y + 2.0 * halfSize));
        v2 = texture2D(texBone, vec2(bone0.x, bone0.y + 4.0 * halfSize));
        v3 = texture2D(texBone, vec2(bone0.x, bone0.y + 6.0* halfSize));
        mat4 mBone0 = mat4(v0, v1, v2, v3);

        v0 = texture2D(texBone, vec2(bone1.x, bone1.y + 0.0 * halfSize));
        v1 = texture2D(texBone, vec2(bone1.x, bone1.y + 2.0 * halfSize));
        v2 = texture2D(texBone, vec2(bone1.x, bone1.y + 4.0 * halfSize));
        v3 = texture2D(texBone, vec2(bone1.x, bone1.y + 6.0 * halfSize));
        mat4 mBone1 = mat4(v0, v1, v2, v3);

        mat4 mBone = mBone0 * boneWeights + mBone1 * (1.0 - boneWeights);

        v0 = texture2D(texBone, vec2(bone0.x, bone0.y + 8.0 * halfSize));
        v1 = texture2D(texBone, vec2(bone0.x, bone0.y + 10.0 * halfSize));
        v2 = texture2D(texBone, vec2(bone0.x, bone0.y + 12.0 *  halfSize));
        v3 = texture2D(texBone, vec2(bone0.x, bone0.y + 14.0 * halfSize));
        mat4 mInv0 = mat4(v0, v1, v2, v3);

        v0 = texture2D(texBone, vec2(bone1.x, bone1.y + 8.0 * halfSize));
        v1 = texture2D(texBone, vec2(bone1.x, bone1.y + 10.0 * halfSize));
        v2 = texture2D(texBone, vec2(bone1.x, bone1.y + 12.0 * halfSize));
        v3 = texture2D(texBone, vec2(bone1.x, bone1.y + 14.0 * halfSize));
        mat4 mInv1 = mat4(v0, v1, v2, v3);
        mat4 mInv = mInv0 * boneWeights + mInv1 * (1.0 - boneWeights);

        vPosition = world * vec4(position, 1.0);

        vNormal = vec4((world * vec4(normal + position, 1.0)).xyz - vPosition.xyz, 1.0);
        vCoord0 = coord0;

        gl_Position = projection * view * world * mBone * mInv * vec4(position, 1.0);
    }
    '''
 
  color0:
    '''
    uniform mat4 world;
    uniform mat4 view;
    uniform mat4 projection;
    attribute vec3 position;
    
    void main() {
        gl_Position = projection * view * world * vec4(position, 1.0);
    }
    '''

  bone0:
    '''
    uniform vec2 boneIndex;
    uniform mat4 boneMatrix;
    
    attribute float colIndex;
    attribute vec3 position;

    varying vec4 vColor;

    void main() {
        float x = 0.0;
        float y = 0.0;
        x = -1.0 + (position.x + boneIndex.x + 0.5) / 128.0;
        y = -1.0 + (position.y + boneIndex.y * 4.0 + 0.5) / 128.0;
        vColor = vec4(boneMatrix[int(colIndex)]);
        gl_Position = vec4(x, y, 0.0, 1.0);
    }
    '''

MMD_GL.fragmentShaderScript =
  toon0:
    '''
    #ifdef GL_ES
    precision highp float;
    #endif
    
    uniform vec3 dlDirection;
    uniform vec3 dlColor;
    
    uniform vec3 color;
    uniform vec3 specular;
    uniform float shiness;
    uniform vec3 ambient;
    
    uniform sampler2D tex0;
    uniform sampler2D texToon;
    
    uniform vec3 eyeVec;

    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vCoord0;
    
    float saturate(float x) {
        return max(min(x, 1.0), 0.0);
    }

    void main() {
        float normalDotLight = saturate(dot(vNormal.xyz, -dlDirection));

        vec3 spcColor = specular * pow(saturate(dot(reflect(-dlDirection, vNormal.xyz), eyeVec)), shiness);
        vec3 ambColor = ambient;
        vec3 tex0Color = texture2D(tex0, vCoord0).xyz;
        vec3 texToonColor = texture2D(texToon, vec2(0.5, 1.0 - normalDotLight)).xyz;
        vec3 dstColor = texToonColor * tex0Color * (color * dlColor + ambient * ambColor + spcColor) ;

        gl_FragColor = vec4(dstColor, 1.0);
    }
    '''

  color0:
    '''
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec3 color;

    void main() {
        gl_FragColor = vec4(color, 1.0);
    }
    '''

  bone0:
    '''
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
    '''
