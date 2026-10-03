import * as THREE from 'three';

export interface GearParams {
  teethCount: number;
  innerRadius: number;  // center hole
  hubRadius: number;    // outer ring radius at root of teeth
  outerRadius: number;  // tip of teeth
  thickness: number;    // depth along Y axis
  windowCount: number;  // open spokes between hub and outer ring
  windowInnerRadius: number;
  windowOuterRadius: number;
  windowAngle: number;
}

export const DEFAULT_GEAR_PARAMS: GearParams = {
  teethCount: 28,
  innerRadius: 0.20,
  hubRadius: 0.82,
  outerRadius: 1.08,
  thickness: 0.34,
  windowCount: 3,
  windowInnerRadius: 0.39,
  windowOuterRadius: 0.70,
  windowAngle: 0.82,
};

export function createGearShape2D(params?: Partial<GearParams>): THREE.Shape {
  const p = { ...DEFAULT_GEAR_PARAMS, ...params };
  const shape = new THREE.Shape();
  
  const toothAngle = (Math.PI * 2) / p.teethCount;
  
  // Broad roots and short tips give the teeth a cast, industrial profile.
  const halfBaseAngle = (toothAngle * 0.52) / 2;
  const halfTipAngle = (toothAngle * 0.34) / 2;
  
  const rootSegments = 3; 

  for (let i = 0; i < p.teethCount; i++) {
    const centerAngle = i * toothAngle;
    
    // start of tooth base
    const baseStartAngle = centerAngle - halfBaseAngle;
    const baseStartX = Math.cos(baseStartAngle) * p.hubRadius;
    const baseStartY = Math.sin(baseStartAngle) * p.hubRadius;
    
    // start of tooth tip
    const tipStartAngle = centerAngle - halfTipAngle;
    const tipStartX = Math.cos(tipStartAngle) * p.outerRadius;
    const tipStartY = Math.sin(tipStartAngle) * p.outerRadius;
    
    // end of tooth tip
    const tipEndAngle = centerAngle + halfTipAngle;
    const tipEndX = Math.cos(tipEndAngle) * p.outerRadius;
    const tipEndY = Math.sin(tipEndAngle) * p.outerRadius;
    
    // end of tooth base
    const baseEndAngle = centerAngle + halfBaseAngle;
    const baseEndX = Math.cos(baseEndAngle) * p.hubRadius;
    const baseEndY = Math.sin(baseEndAngle) * p.hubRadius;
    
    if (i === 0) {
      shape.moveTo(baseStartX, baseStartY);
    } else {
      shape.lineTo(baseStartX, baseStartY);
    }
    
    // Tooth left wall
    shape.lineTo(tipStartX, tipStartY);
    // Tooth tip
    shape.lineTo(tipEndX, tipEndY);
    // Tooth right wall
    shape.lineTo(baseEndX, baseEndY);
    
    // Root arc to next tooth
    const nextCenterAngle = (i + 1) * toothAngle;
    const nextBaseStartAngle = nextCenterAngle - halfBaseAngle;
    const rootAngleDiff = nextBaseStartAngle - baseEndAngle;
    
    for (let j = 1; j <= rootSegments; j++) {
      const arcAngle = baseEndAngle + (rootAngleDiff * j) / rootSegments;
      shape.lineTo(Math.cos(arcAngle) * p.hubRadius, Math.sin(arcAngle) * p.hubRadius);
    }
  }
  
  // Create center hole
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, p.innerRadius, 0, Math.PI * 2, false);
  shape.holes.push(holePath);

  // Three curved windows leave a substantial central hub and outer tooth ring,
  // matching the open-spoke casting instead of a flat solid gear blank.
  for (let windowIndex = 0; windowIndex < p.windowCount; windowIndex++) {
    const centerAngle = (windowIndex / p.windowCount) * Math.PI * 2 + Math.PI / 6;
    const startAngle = centerAngle - p.windowAngle / 2;
    const endAngle = centerAngle + p.windowAngle / 2;
    const windowPath = new THREE.Path();
    const arcSegments = 10;

    for (let segment = 0; segment <= arcSegments; segment++) {
      const angle = startAngle + ((endAngle - startAngle) * segment) / arcSegments;
      const x = Math.cos(angle) * p.windowOuterRadius;
      const y = Math.sin(angle) * p.windowOuterRadius;
      if (segment === 0) windowPath.moveTo(x, y);
      else windowPath.lineTo(x, y);
    }
    for (let segment = arcSegments; segment >= 0; segment--) {
      const angle = startAngle + ((endAngle - startAngle) * segment) / arcSegments;
      windowPath.lineTo(
        Math.cos(angle) * p.windowInnerRadius,
        Math.sin(angle) * p.windowInnerRadius
      );
    }
    windowPath.closePath();
    shape.holes.push(windowPath);
  }
  
  return shape;
}

export function createGearGeometry(params?: Partial<GearParams>): THREE.BufferGeometry {
  const p = { ...DEFAULT_GEAR_PARAMS, ...params };
  const shape = createGearShape2D(p);
  
  const extrudeSettings = {
    depth: p.thickness,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 16,
  };
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // Rotate to lie flat on XZ plane
  geometry.rotateX(Math.PI / 2);
  
  // Center geometric bounding box on Y axis
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  if (bb) {
    geometry.translate(0, - (bb.max.y + bb.min.y) / 2, 0);
  }
  
  geometry.computeVertexNormals();
  return geometry;
}
