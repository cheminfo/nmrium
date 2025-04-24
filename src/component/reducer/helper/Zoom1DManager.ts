import { scaleLinear, zoomIdentity } from 'd3';
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

function setZoom(
  draft: Draft<State>,
  options: {
    scale?: number;
    spectrumID?: string;
  } = {},
) {
  const { height, margin, originDomain, yDomains } = draft;
  const activeSpectrum = getActiveSpectrum(draft);
  const { scale = 1, spectrumID = null } = options;

  if (activeSpectrum === null && spectrumID === null) {
    const { shareYDomain, yDomain, yDomains } = originDomain;

    draft.yDomains = Object.fromEntries(
      Object.keys(yDomains).map((id) => {
        const _scale = scaleLinear(shareYDomain ? yDomain : yDomains[id], [
          height - margin.bottom,
          margin.top,
        ]);
        const [min, max] = shareYDomain ? yDomain : yDomains[id];
        const maxPoint = Math.max(Math.abs(max), Math.abs(min));
        const scalePoint = maxPoint === Math.abs(max) ? 0 : min;
        const t = zoomIdentity
          .translate(0, _scale(scalePoint))
          .scale(scale)
          .translate(0, -_scale(0));
        const newYDomain = t.rescaleY(_scale).domain();
        return [id, [0, newYDomain[1]]];
      }),
    );
  } else {
    const spectrumId = spectrumID || activeSpectrum?.id;
    if (spectrumId) {
      const _scale = scaleLinear(originDomain.yDomains[spectrumId], [
        height - margin.bottom,
        margin.top,
      ]);
      const t = zoomIdentity
        .translate(0, _scale(0))
        .scale(scale)
        .translate(0, -_scale(0));
      const yDomain = t.rescaleY(_scale).domain();

      draft.yDomains = {
        ...yDomains,
        [spectrumId]: [0, yDomain[1]],
      };
    }
  }
}

export { setZoom, wheelZoom, toScaleRatio };
