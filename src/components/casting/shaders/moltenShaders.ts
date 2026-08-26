export const moltenSurfaceShader = {
  uniforms: () => ({
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uLevel: { value: 0.0 },
  }),
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    uniform float uTime;
    uniform float uIntensity;

    void main() {
      vUv = uv;
      vNormal = normal;
      vec3 pos = position;
      
      // ripples
      pos.y += sin(pos.x * 8.0 + uTime * 3.0) * cos(pos.z * 6.0 + uTime * 2.5) * 0.02 * uIntensity;
      
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    uniform float uTime;
    uniform float uIntensity;

    float hash(vec2 p) { 
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); 
    }

    void main() {
      vec2 noiseUv = vWorldPos.xz * 5.0 + uTime * 0.5;
      float n = hash(floor(noiseUv));
      
      vec3 deepRed = vec3(0.8, 0.13, 0.0);
      vec3 brightOrange = vec3(1.0, 0.53, 0.0);
      
      vec3 color = mix(deepRed, brightOrange, n * uIntensity);
      
      // Fresnel rim glow
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      fresnel = pow(fresnel, 3.0);
      
      color += vec3(1.0, 0.8, 0.2) * fresnel * uIntensity;
      
      // High emissive values
      vec3 emissive = color * 4.0;
      
      gl_FragColor = vec4(emissive, 1.0);
    }
  `,
};

export const pourStreamShader = {
  uniforms: () => ({
    uTime: { value: 0 },
    uOpacity: { value: 1.0 },
  }),
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform float uTime;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;
      
      // wave displacement along Y
      pos.x += sin(pos.y * 12.0 - uTime * 14.0) * 0.03 * (1.0 - uv.y);
      pos.z += cos(pos.y * 10.0 + uTime * 12.0) * 0.025 * (1.0 - uv.y);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewDir = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform float uTime;
    uniform float uOpacity;

    void main() {
      // Hot white core
      float core = smoothstep(0.3, 0.5, 1.0 - abs(vUv.x - 0.5) * 2.0);
      
      // Streaks
      float streaks = sin(vUv.y * 24.0 - uTime * 18.0 + vUv.x * 8.0) * 0.5 + 0.5;
      
      vec3 coreColor = vec3(1.0, 1.0, 0.9);
      vec3 edgeColor = vec3(1.0, 0.3, 0.0);
      
      vec3 color = mix(edgeColor, coreColor, core + streaks * 0.2);
      
      vec3 viewDir = normalize(vViewDir);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      fresnel = pow(fresnel, 2.0);
      
      color += edgeColor * fresnel * 2.0;
      
      vec3 emissive = color * 3.5;
      
      gl_FragColor = vec4(emissive, uOpacity);
    }
  `,
};

export const heatGlowShader = {
  uniforms: () => ({
    uTime: { value: 0 },
    uTemperature: { value: 0.0 },
  }),
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float uTime;
    uniform float uTemperature;

    float hash(vec2 p) { 
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); 
    }

    void main() {
      float n = hash(vUv * 10.0 + uTime * 0.1) * 0.1;
      float temp = clamp(uTemperature + n, 0.0, 1.0);
      
      vec3 highColor = vec3(1.0, 0.9, 0.5);
      vec3 midColor = vec3(1.0, 0.4, 0.0);
      vec3 lowColor = vec3(0.4, 0.05, 0.0);
      
      vec3 color = vec3(0.0);
      if (temp > 0.7) {
        color = mix(midColor, highColor, (temp - 0.7) / 0.3);
      } else if (temp > 0.3) {
        color = mix(lowColor, midColor, (temp - 0.3) / 0.4);
      } else {
        color = mix(vec3(0.0), lowColor, temp / 0.3);
      }
      
      vec3 emissive = color * (temp * 2.0);
      float alpha = temp * 0.8;
      
      gl_FragColor = vec4(emissive, alpha);
    }
  `,
};
