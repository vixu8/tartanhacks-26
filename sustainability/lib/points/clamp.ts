import { MAX_POINTS, MIN_POINTS } from './constants';

export function clampPoints(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(MIN_POINTS, Math.min(MAX_POINTS, Math.trunc(n)));
}
