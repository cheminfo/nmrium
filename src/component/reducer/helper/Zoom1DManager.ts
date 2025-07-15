import type { Draft } from 'immer';

import type { ZoomOptions } from '../../EventsTrackers/BrushTracker.js';
import type { State } from '../Reducer.js';

import { getActiveSpectrum } from './getActiveSpectrum.js';

export const ZOOM_TYPES = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
  BIDIRECTIONAL: 'BIDIRECTIONAL',
  FULL: 'FULL',
} as const;

export type ZoomType = keyof typeof ZOOM_TYPES;

function toScaleRatio(
  options: { invertScroll?: boolean; delta: number },
  zoomOptions: ScaleRationOptions = {},
) {
  const { invertScroll = false } = options;
  const { factor = 1 } = zoomOptions;

  const normalizeDelta =
    Math.abs(options.delta) < 100 ? options.delta * 100 : options.delta;
  const delta = normalizeDelta * (invertScroll ? -0.001 : 0.001) * factor;
  const ratio = delta < 0 ? -1 / (delta - 1) : 1 + delta;

  return ratio;
}

interface ScaleRationOptions {
  factor?: number;
}
function wheelZoom(
  options: ZoomOptions,
  domain: number[],
  scaleOptions: ScaleRationOptions = {},
): number[] {
  const { deltaY, invertScroll } = options;
  const ratio = toScaleRatio({ delta: deltaY, invertScroll }, scaleOptions);
  const [min, max] = domain;
  return [min * ratio, max * ratio];
}

function mapSharedDomain(draft: Draft<State>) {
  const {
    originDomain: { yDomain },
  } = draft;

  const targetDomain = {};

  for (const spectrumKey of Object.keys(draft.yDomains)) {
    targetDomain[spectrumKey] = yDomain;
  }
  return targetDomain;
}

function setZoom(
  draft: Draft<State>,
  options: {
    scale?: number;
    spectrumID?: string;
  } = {},
) {
  const { originDomain, yDomains } = draft;
  const activeSpectrum = getActiveSpectrum(draft);
  const { scale = 1, spectrumID = null } = options;

  const rescaleAllSpectra = activeSpectrum === null && spectrumID === null;

  if (rescaleAllSpectra) {
    const { shareYDomain, yDomains } = originDomain;
    const targetDomain = shareYDomain ? mapSharedDomain(draft) : yDomains;
    draft.yDomains = rescaleToSameTop(targetDomain, {
      scale,
      useZeroAsPivot: shareYDomain,
    });
    return;
  }

  const spectrumId = spectrumID || activeSpectrum?.id;

  if (!spectrumId) return;

  const yDomain = rescaleDomain(originDomain.yDomains[spectrumId], { scale });

  draft.yDomains = {
    ...yDomains,
    [spectrumId]: yDomain,
  };
}

interface RescaleOptions {
  scale?: number;
  useZeroAsPivot?: boolean;
}

function rescaleDomain(domain: number[], options: RescaleOptions = {}) {
  const { scale: externalScale = 0.8, useZeroAsPivot = false } = options;
  const scale = 1 / externalScale;

  const [min, max] = domain;

  const pivot = Math.abs(max) > Math.abs(min) || useZeroAsPivot ? 0 : min;
  const distMin = min - pivot;
  const distMax = max - pivot;
  const newMin = distMin * scale;
  const newMax = distMax * scale;

  return [newMin, newMax];
}

function rescaleToSameTop(
  yDomains: Record<string, number[]>,
  options: RescaleOptions = {},
) {
  const newYDomains = {};
  for (const spectrumId of Object.keys(yDomains)) {
    newYDomains[spectrumId] = rescaleDomain(yDomains[spectrumId], options);
  }
  return newYDomains;
}

export { rescaleToSameTop, setZoom, toScaleRatio, wheelZoom };
