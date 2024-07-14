uniform float uTime;
uniform sampler2D uPerlinTexture;
uniform float uSmokeInt;
uniform vec3 uSmokeC;

varying vec2 vUv;

void main(){

    // Scale and animate
    vec2 smokeUV = vUv;
    smokeUV.x *= 0.5;
    smokeUV.y *= 0.3;
    smokeUV.y -= uTime * 0.03;

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUV).r;

    // Remap
    smoke = smoothstep(uSmokeInt, 1.0, smoke);

    // Edges
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);

    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);
    

    // Final Color
    gl_FragColor = vec4(uSmokeC, smoke);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}