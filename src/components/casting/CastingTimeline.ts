// Shared mutable state - updated by CastingScene, read by all components in useFrame
export const castingState = { progress: 0, debug: false };

export const PHASES = {
  MOLD_OPEN:          { start: 0.00, end: 0.08 },
  MOLD_CLOSE:         { start: 0.08, end: 0.15 },
  TRANSITION_FURNACE: { start: 0.15, end: 0.20 },
  FURNACE_EMPTY:      { start: 0.20, end: 0.27 },
  FURNACE_FILL:       { start: 0.27, end: 0.34 },
  FURNACE_TILT:       { start: 0.34, end: 0.42 },
  FURNACE_POUR:       { start: 0.42, end: 0.50 },
  LADLE_TO_MOLD:      { start: 0.50, end: 0.58 },
  LADLE_POUR:         { start: 0.58, end: 0.68 },
  MOLD_HOT:           { start: 0.68, end: 0.75 },
  COOLING:            { start: 0.75, end: 0.82 },
  MOLD_OPEN_REVEAL:   { start: 0.82, end: 0.89 },
  GEAR_REVEALED:      { start: 0.89, end: 0.94 },
  GEAR_EXTRACT:       { start: 0.94, end: 0.98 },
  FINAL_PRODUCT:      { start: 0.98, end: 1.00 },
} as const;

export type PhaseName = keyof typeof PHASES;

/** Returns local phase progress 0-1 for a given global progress and phase */
export function phaseProgress(globalProgress: number, phase: PhaseName): number {
  const { start, end } = PHASES[phase];
  if (globalProgress <= start) return 0;
  if (globalProgress >= end) return 1;
  return (globalProgress - start) / (end - start);
}

/** Smooth ease in-out */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/** Ease out quad */
export function easeOut(t: number): number {
  return t * (2 - t);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Smoothstep */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Clamp */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Returns true if global progress is within a phase range */
export function isInPhase(globalProgress: number, phase: PhaseName): boolean {
  const { start, end } = PHASES[phase];
  return globalProgress >= start && globalProgress <= end;
}
