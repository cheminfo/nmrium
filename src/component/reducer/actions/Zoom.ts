import { zoomIdentity, scaleLinear } from 'd3';
import { Draft } from 'immer';

import { State } from '../Reducer';
import Zoom1DManager, { setAllScales } from '../helper/Zoom1DManager';

export const ZoomType = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
  STEP_HORIZONTAL: 'STEP_HORIZONTAL',
  FULL: 'FULL',
};

export function wheel(
  deltaY,
  deltaMode,
  draft: Draft<State>,
  id: string | null = null,
) {
  if (draft.activeSpectrum?.id || id) {
    Zoom1DManager(draft.zoom.spectra).wheel(
      deltaY,
      id || (draft.activeSpectrum?.id as string),
    );
  } else {
    const zoomManager = Zoom1DManager(draft.zoom.spectra);
    draft.data.forEach((datum) => {
      if (
        datum.info.dimension === 1 &&
        draft.activeTab === datum.info.nucleus
      ) {
        zoomManager.wheel(deltaY, datum.id);
      }
    });
  }
}

function setZoom(
  draft: Draft<State>,
  options: {
    scale?: number;
    spectrumID?: string;
    shareYDomain?: boolean;
  } = {},
) {
  const { height, margin, activeSpectrum } = draft;
  const { scale = null, spectrumID = null } = options;

  if (scale) {
    setAllScales(draft.zoom.spectra, scale);
  }

  if (activeSpectrum === null && spectrumID === null) {
    const zoomManager = Zoom1DManager(draft.zoom.spectra);
    const { shareYDomain, yDomain, yDomains } = draft.originDomain;
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const scale = zoomManager.getScale(id);
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
      const scale = Zoom1DManager(draft.zoom.spectra).getScale(spectrumId);
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

function setZoom1D(draft, height, margin, index, defaultScale?: number) {
  const { originDomain, tabActiveSpectrum, activeTab } = draft;

  const { id } = tabActiveSpectrum[activeTab.split(',')[index]];
  const { setScale, getScale } = Zoom1DManager(draft.zoom.spectra);
  if (defaultScale) {
    setScale(defaultScale, id);
  }
  const scale = getScale(id);

  const _scale = scaleLinear(originDomain.yDomains[id], [
    height - margin,
    margin,
  ]);
  const t = zoomIdentity
    .translate(0, _scale(0))
    .scale(scale)
    .translate(0, -_scale(0));
  let yDomain = t.rescaleY(_scale).domain();
  draft.yDomains[id] = yDomain;
}

export { setZoom, setZoom1D };
