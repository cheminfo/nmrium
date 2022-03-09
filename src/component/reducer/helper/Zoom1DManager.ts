import { zoomIdentity, scaleLinear } from 'd3';
import { Draft } from 'immer';

import { State } from '../Reducer';

export const ZoomType = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
  STEP_HORIZONTAL: 'STEP_HORIZONTAL',
  FULL: 'FULL',
};
interface ZoomOptions {
  factor?: number;
  invert?: boolean;
}
function wheelZoom(
  event: WheelEvent,
  domain: number[],
  zoomOptions: ZoomOptions = {},
): number[] {
  const { factor = 1, invert = false } = zoomOptions;
  const deltaY =
    Math.abs(event.deltaY) < 100 ? event.deltaY * 100 : event.deltaY;
  const delta = deltaY * (invert ? -0.001 : 0.001) * factor;
  const ratio = delta < 0 ? -1 / (delta - 1) : 1 + delta;

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
  const { height, margin, activeSpectrum } = draft;
  const { scale = 1, spectrumID = null } = options;

  if (activeSpectrum === null && spectrumID === null) {
    const { shareYDomain, yDomain, yDomains } = draft.originDomain;
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const _scale = scaleLinear(shareYDomain ? yDomain : yDomains[id], [
        height - margin.bottom,
        margin.top,
      ]);
      const [min, max] = shareYDomain ? yDomain : yDomains[id];
      const maxPoint = Math.max(Math.abs(max), Math.abs(min));
      const scalePoint = maxPoint === max ? 0 : min;
      const t = zoomIdentity
        .translate(
          0,
          Math.sign(scalePoint) >= 0 ? _scale(scalePoint) : _scale(scalePoint),
        )
        .scale(scale)
        .translate(0, -_scale(0));
      const newYDomain = t.rescaleY(_scale).domain();
      acc[id] = newYDomain;
      return acc;
    }, {});
  } else {
    const spectrumId = spectrumID || activeSpectrum?.id;
    if (spectrumId) {
      const _scale = scaleLinear(draft.originDomain.yDomains[spectrumId], [
        height - margin.bottom,
        margin.top,
      ]);
      const t = zoomIdentity
        .translate(0, _scale(0))
        .scale(scale)
        .translate(0, -_scale(0));
      const yDomain = t.rescaleY(_scale).domain();

      draft.yDomains = {
        ...draft.yDomains,
        [spectrumId]: yDomain,
      };
    }
  }
}

export { setZoom, wheelZoom };
