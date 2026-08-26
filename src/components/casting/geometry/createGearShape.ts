import * as THREE from 'three';

export interface GearParams {
  teethCount: number;
  innerRadius: number;  // center hole
  hubRadius: number;    // body radius at root of teeth
  outerRadius: number;  // tip of teeth
  thickness: number;    // depth along Y axis
}

export const DEFAULT_GEAR_PARAMS: GearParams = {
  teethCount: 12,
  innerRadius: 0.25,
  hubRadius: 0.55,
  outerRadius: 0.95,
  thickness: 0.3,
};

export function createGearShape2D(params?: Partial<GearParams>): THREE.Shape {
  const p = { ...DEFAULT_GEAR_PARAMS, ...params };
  const shape = new THREE.Shape();
  
  const toothAngle = (Math.PI * 2) / p.teethCount;
  
  // tooth base width ~35% of tooth angle
  const halfBaseAngle = (toothAngle * 0.35) / 2;
  // tooth tip width ~20% of tooth angle
  const halfTipAngle = (toothAngle * 0.20) / 2;
  
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
  
  return shape;
}

export function createGearGeometry(params?: Partial<GearParams>): THREE.BufferGeometry {
  const p = { ...DEFAULT_GEAR_PARAMS, ...params };
  const shape = createGearShape2D(p);
  
  const extrudeSettings = {
    depth: p.thickness,
    bevelEnabled: false,
    curveSegments: 12,
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
