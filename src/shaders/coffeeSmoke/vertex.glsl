uniform float uTime;
uniform sampler2D uPerlinTexture;
uniform float uSmokeAng;
uniform vec2 uWindSpeed;

varying vec2 vUv;

// Functions from includes
#include ../includes/rotate2D.glsl

void main(){
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture(
        uPerlinTexture, 
        vec2(0.5, uv.y * 0.2 - uTime * 0.005)
    ).r;
    float angle = twistPerlin * uSmokeAng;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
        texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
    );
    windOffset *= pow(uv.y, 2.0) * 10.0;
    newPosition.xz += windOffset * uWindSpeed;

    // Final Position 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Varyings
    vUv = uv;
}