import type { TreeStage } from '@/lib/points/treeStage';

const TREE_IMAGE_BY_STAGE: Record<TreeStage, string> = {
  0: '../../assets/images/android-icon-background.png',
  1: '../../assets/images/android-icon-foreground.png',
  2: '../../assets/images/tree-placeholder.png',
  3: '../../assets/images/icon.png',
  4: '../../assets/images/splash-icon.png',
};

export function treeStageToImage(stage: TreeStage): string {
  return TREE_IMAGE_BY_STAGE[stage];
}
