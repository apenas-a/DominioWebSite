import { useMemo } from 'react';

export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualitySettings {
  level: QualityLevel;
  dpr: number;
  shadows: boolean;
  bloomEnabled: boolean;
  bloomStrength: number;
  particleCount: number;
  streamSegments: number;
}

export function useResponsiveQuality(): QualitySettings {
  return useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) < 4;
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || isLowEnd || prefersReduced) {
      return {
        level: 'low',
        dpr: 1,
        shadows: false,
        bloomEnabled: false,
        bloomStrength: 0,
        particleCount: 40,
        streamSegments: 8,
      };
    }
    
    const isHighEnd = typeof window !== 'undefined' && window.devicePixelRatio >= 2 && (navigator.hardwareConcurrency || 4) >= 8;
    
    if (isHighEnd) {
      return {
        level: 'high',
        dpr: Math.min(window.devicePixelRatio, 2),
        shadows: true,
        bloomEnabled: true,
        bloomStrength: 1.2,
        particleCount: 200,
        streamSegments: 24,
      };
    }
    
    return {
      level: 'medium',
      dpr: 1.5,
      shadows: false,
      bloomEnabled: true,
      bloomStrength: 0.8,
      particleCount: 100,
      streamSegments: 16,
    };
  }, []);
}
