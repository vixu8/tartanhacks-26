import { clampPoints } from './clamp';

export type TreeStage = 0 | 1 | 2 | 3 | 4;

export function pointsToTreeStage(points: number): TreeStage {
  const p = clampPoints(points);
  if (p <= -61) return 0;
  if (p <= -21) return 1;
  if (p <= 20) return 2;
  if (p <= 60) return 3;
  return 4;
}
