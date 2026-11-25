import { describe, expect, it, vi } from 'vitest';

import type { PredictedSpectraResult } from '../../../data/PredictionManager.js';
import { warnEmpty2DExperiments } from '../warnEmpty2DExperiments.js';

function asPredictedSpectra(
  spectra: Record<string, { signals: unknown[] }>,
): PredictedSpectraResult {
  return spectra;
}

describe('warnEmpty2DExperiments', () => {
  it('shows one warning naming the empty experiment and the molecule label', () => {
    const show = vi.fn();
    const warned = warnEmpty2DExperiments(
      { show },
      asPredictedSpectra({ hmbc: { signals: [] } }),
      { moleculeLabel: 'Prediction 1' },
    );

    expect(warned).toEqual(['hmbc']);
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith({
      message:
        'HMBC prediction is empty: no spectrum was simulated (Prediction 1).',
      intent: 'warning',
    });
  });

  it('does not warn when every 2D prediction has signals', () => {
    const show = vi.fn();
    const warned = warnEmpty2DExperiments(
      { show },
      asPredictedSpectra({
        cosy: { signals: [{ id: 'cosy-1' }] },
        hsqc: { signals: [{ id: 'hsqc-1' }] },
        hmbc: { signals: [{ id: 'hmbc-1' }] },
      }),
      { moleculeLabel: 'Prediction 1' },
    );

    expect(warned).toEqual([]);
    expect(show).not.toHaveBeenCalled();
  });

  it('returns every empty experiment in the canonical experiment order', () => {
    const show = vi.fn();
    const warned = warnEmpty2DExperiments(
      { show },
      asPredictedSpectra({
        cosy: { signals: [] },
        hsqc: { signals: [{ id: 'hsqc-1' }] },
        hmbc: { signals: [] },
      }),
    );

    expect(warned).toEqual(['cosy', 'hmbc']);
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith({
      message: 'COSY, HMBC prediction is empty: no spectrum was simulated.',
      intent: 'warning',
    });
  });

  it('omits the molecule label when it is empty', () => {
    const show = vi.fn();
    warnEmpty2DExperiments(
      { show },
      asPredictedSpectra({ hmbc: { signals: [] } }),
      { moleculeLabel: '' },
    );

    expect(show).toHaveBeenCalledWith({
      message: 'HMBC prediction is empty: no spectrum was simulated.',
      intent: 'warning',
    });
  });
});
