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
      
      vec3 darkMetal = vec3(0.2, 0.05, 0.02);
      vec3 deepRed = vec3(0.85, 0.18, 0.02);
      vec3 brightOrange = vec3(1.0, 0.65, 0.15);
      vec3 whiteHot = vec3(1.0, 0.95, 0.8);
      
      // Color ramp based on intensity
      vec3 baseCol = mix(darkMetal, deepRed, clamp(uIntensity * 1.5, 0.0, 1.0));
      vec3 hotCol = mix(baseCol, brightOrange, clamp((uIntensity - 0.3) * 1.8, 0.0, 1.0));
      hotCol = mix(hotCol, whiteHot, clamp((uIntensity - 0.75) * 4.0, 0.0, 1.0));
      
      vec3 color = mix(hotCol, brightOrange, n * 0.25 * uIntensity);
      
      // Fresnel rim glow
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      fresnel = pow(fresnel, 2.5);
      
      color += vec3(1.0, 0.85, 0.3) * fresnel * uIntensity;
      
      // Scale emissive with intensity so 0.0 has zero glow
      vec3 emissive = color * (uIntensity * 4.5);
      
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

export const gearCastingShader = {
  uniforms: () => ({
    uTime: { value: 0 },
    uFillProgress: { value: 0.0 }, // 0.0 to 1.0 (fills dente por dente)
    uTemperature: { value: 1.0 },  // 1.0 (~1400°C) to 0.0 (25°C)
    uThickness: { value: 0.28 },
  }),
  vertexShader: `
    varying vec3 vLocalPos;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vLocalPos = position;
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec3 vLocalPos;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uTime;
    uniform float uFillProgress;
    uniform float uTemperature;
    uniform float uThickness;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      // If not started filling, discard
      if (uFillProgress <= 0.001) {
        discard;
      }

      // 1. Tooth-by-tooth and vertical fill progression (Ref. 16)
      // Angle theta: 0 is at +X (where sprue runner gate connects)
      float angle = atan(vLocalPos.z, vLocalPos.x);
      // Angular distance from gate: 0 at +X, 1 at -X (opposing side)
      float angDist = abs(angle) / 3.14159265;

      // Normalized height in cavity: 0 at bottom, 1 at top
      float halfH = uThickness * 0.5;
      float normH = clamp((vLocalPos.y + halfH) / uThickness, 0.0, 1.0);

      // Fluid fills through each tooth and rises simultaneously
      float fillThreshold = normH * 0.40 + angDist * 0.60;

      // Discard fragments not yet reached by the advancing molten metal
      if (uFillProgress < 0.999 && fillThreshold > uFillProgress) {
        discard;
      }

      // 2. Leading molten meniscus wave sizzle
      float frontDist = uFillProgress - fillThreshold;
      float isFront = (uFillProgress < 0.999 && frontDist >= 0.0 && frontDist < 0.05) ? 1.0 : 0.0;

      // 3. Thermal Radiation & Color Gradient (~1400°C -> 25°C) (Ref. 17)
      vec3 whiteHot = vec3(1.0, 0.96, 0.88);
      vec3 moltenYellow = vec3(1.0, 0.72, 0.15);
      vec3 moltenOrange = vec3(0.98, 0.38, 0.04);
      vec3 dullCherry = vec3(0.55, 0.06, 0.01);
      vec3 coolIron = vec3(0.18, 0.20, 0.24);

      vec3 thermalCol;
      float emissiveMul;

      if (uTemperature > 0.75) {
        float t = (uTemperature - 0.75) / 0.25;
        thermalCol = mix(moltenYellow, whiteHot, t);
        emissiveMul = 3.5 + t * 2.0;
      } else if (uTemperature > 0.40) {
        float t = (uTemperature - 0.40) / 0.35;
        thermalCol = mix(moltenOrange, moltenYellow, t);
        emissiveMul = 1.6 + t * 1.9;
      } else if (uTemperature > 0.15) {
        float t = (uTemperature - 0.15) / 0.25;
        thermalCol = mix(dullCherry, moltenOrange, t);
        emissiveMul = 0.3 + t * 1.3;
      } else {
        float t = uTemperature / 0.15;
        thermalCol = mix(coolIron, dullCherry, t);
        emissiveMul = t * 0.3;
      }

      // Liquid convective ripple noise when hot
      vec2 noiseCoord = vLocalPos.xz * 6.0 + vec2(uTime * 0.8, sin(uTime * 0.5));
      float n = hash(floor(noiseCoord));
      if (uTemperature > 0.5) {
        thermalCol = mix(thermalCol, whiteHot, n * 0.18 * (uTemperature - 0.5) * 2.0);
      }

      // Highlight the leading meniscus wave
      if (isFront > 0.5) {
        thermalCol = mix(thermalCol, whiteHot, 0.85);
        emissiveMul = 6.0;
      }

      // Fresnel rim glow
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      fresnel = pow(fresnel, 2.2);

      vec3 finalEmissive = (thermalCol + vec3(1.0, 0.6, 0.1) * fresnel * uTemperature) * emissiveMul;

      // Base shading when cooled
      vec3 lightDir = normalize(vec3(5.0, 8.0, 5.0));
      float diff = max(dot(vNormal, lightDir), 0.15);
      vec3 diffuseCol = coolIron * diff;

      vec3 finalColor = mix(diffuseCol, finalEmissive, clamp(uTemperature * 1.2 + isFront, 0.0, 1.0));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

