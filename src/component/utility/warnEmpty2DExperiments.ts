import type { PredictedSpectraResult } from '../../data/PredictionManager.js';
import { getEmpty2DExperiments } from '../../data/PredictionManager.js';

/**
 * Minimal structural view of the toaster so the helper can be tested without
 * the React context. The object returned by `useToaster()` satisfies it.
 */
interface ToasterLike {
  show(options: { message: string; intent: 'warning' }): unknown;
}

/**
 * Show a single warning toast listing the requested 2D experiments whose
 * prediction produced no signals and was therefore not simulated.
 * Returns the warned experiment names.
 */
export function warnEmpty2DExperiments(
  toaster: ToasterLike,
  predictedSpectra: PredictedSpectraResult,
  options?: { moleculeLabel?: string },
): ReturnType<typeof getEmpty2DExperiments> {
  const emptyExperiments = getEmpty2DExperiments(predictedSpectra);
  if (emptyExperiments.length === 0) {
    return emptyExperiments;
  }

  const { moleculeLabel } = options ?? {};
  const suffix = moleculeLabel ? ` (${moleculeLabel})` : '';
  toaster.show({
    message: `${emptyExperiments
      .join(', ')
      .toUpperCase()} prediction is empty: no spectrum was simulated${suffix}.`,
    intent: 'warning',
  });

  return emptyExperiments;
}
