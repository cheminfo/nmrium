import type { Draft } from 'immer';
import { expect, test } from 'vitest';

import type { State } from '../../Reducer.ts';
import {
  addToBrushHistory,
  restoreLastZoomDomain,
  restoreLastZoomUnlessDomainChanged,
} from '../ZoomHistoryManager.ts';

/**
 * Minimal draft exposing only what `addToBrushHistory`,
 * `restoreLastZoomDomain` and `restoreLastZoomUnlessDomainChanged` read from
 * the reducer state.
 */
function createDraft(isFt: boolean): Draft<State> {
  return {
    displayerMode: '1D',
    xDomain: [0, 100],
    yDomain: [0, 1],
    yDomains: {},
    data: [{ info: { isFt } }],
    view: {
      spectra: {
        activeTab: '1H',
        activeSpectra: { '1H': [{ index: 0, selected: true }] },
      },
    },
    zoom: { history: {} },
  } as unknown as Draft<State>;
}

test('restores the last zoom domain when no FID/FT transition happened', () => {
  const draft = createDraft(false);

  // user brushes a zoom on the current (FID) spectrum
  addToBrushHistory(draft, { axis: 'X', xDomain: [20, 40], yDomain: [0, 1] });
  expect(draft.xDomain).toStrictEqual([20, 40]);

  // toggling a processing that does not change the FID/FT state resets the
  // domain and then restores the user zoom
  draft.xDomain = [-10, 10];
  const restored = restoreLastZoomUnlessDomainChanged(draft, false);

  expect(restored).toBe(true);
  expect(draft.xDomain).toStrictEqual([20, 40]);
});

test('discards the stale zoom domain on a FID -> FT transition (FFT enabled)', () => {
  const draft = createDraft(false);

  // user brushes a zoom while the spectrum is in the FID state
  addToBrushHistory(draft, { axis: 'X', xDomain: [20, 40], yDomain: [0, 1] });

  // enabling FFT switches to FT and recomputes the full domain
  draft.data[0].info.isFt = true;
  draft.xDomain = [-10, 10];
  const restored = restoreLastZoomUnlessDomainChanged(draft, false);

  // the FID zoom must not be applied on the regenerated FT axis
  expect(restored).toBe(false);
  expect(draft.xDomain).toStrictEqual([-10, 10]);
  expect(draft.zoom.history['1H']).toStrictEqual([]);
});

test('discards the stale zoom domain on a FT -> FID transition (FFT disabled)', () => {
  const draft = createDraft(true);

  // user brushes a zoom while the spectrum is in the FT state
  addToBrushHistory(draft, { axis: 'X', xDomain: [2, 4], yDomain: [0, 1] });

  // disabling FFT switches back to FID and recomputes the full domain
  draft.data[0].info.isFt = false;
  draft.xDomain = [0, 100];
  const restored = restoreLastZoomUnlessDomainChanged(draft, true);

  expect(restored).toBe(false);
  expect(draft.xDomain).toStrictEqual([0, 100]);
  expect(draft.zoom.history['1H']).toStrictEqual([]);
});

test('restoreLastZoomDomain keeps its default behaviour (restore when possible)', () => {
  const draft = createDraft(false);

  addToBrushHistory(draft, { axis: 'X', xDomain: [20, 40], yDomain: [0, 1] });
  draft.xDomain = [-10, 10];

  expect(restoreLastZoomDomain(draft)).toBe(true);
  expect(draft.xDomain).toStrictEqual([20, 40]);
});
