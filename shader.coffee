MMD_GL.vertexShaderScript = 
  toon0:
    '''
    uniform mat4 world;
    uniform mat4 worldViewProjection;
    
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 coord0;
    attribute vec2 texCoord;

    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vCoord0;
    
    void main() {

        vPosition = world * vec4(position, 1.0);

        vNormal = vec4((world * vec4(normal + position, 1.0)).xyz - vPosition.xyz, 1.0);
        
        vCoord0 = coord0;

        gl_Position = worldViewProjection * vec4(position, 1.0);
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
