import {
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

import { clampPoints } from './clamp';
import { pointsToTreeStage, type TreeStage } from './treeStage';

type ApplyImpactArgs = {
  db: Firestore;
  userId: string;
  impact: number;
  eventId?: string;
};

type ApplyImpactResult = {
  treeStage: TreeStage;
};

export async function applyImpactToUser({
  db,
  userId,
  impact,
  eventId,
}: ApplyImpactArgs): Promise<ApplyImpactResult> {
  const normalizedImpact = Math.trunc(impact);

  const treeStage = await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await tx.get(userRef);
    const prevPointsRaw = userSnap.exists() ? userSnap.data()?.points : 0;
    const prevPoints = typeof prevPointsRaw === 'number' ? prevPointsRaw : 0;
    const nextPoints = clampPoints(prevPoints + normalizedImpact);

    tx.set(
      userRef,
      {
        points: nextPoints,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (eventId) {
      const eventRef = doc(db, 'events', eventId);
      tx.set(eventRef, { impact: normalizedImpact }, { merge: true });
    }

    return pointsToTreeStage(nextPoints);
  });

  return { treeStage };
}
