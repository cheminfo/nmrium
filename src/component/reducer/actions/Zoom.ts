import { zoomIdentity, scaleLinear } from 'd3';
import { Draft } from 'immer';

import { State } from '../Reducer';
import Zoom1DManager, { setAllScales } from '../helper/Zoom1DManager';

export const ZoomType = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
  STEP_HROZENTAL: 'STEP_HROZENTAL',
  FULL: 'FULL',
};

export function wheel(deltaY, deltaMode, draft: Draft<State>, id = null) {
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
  defaultScale: number | null = null,
  spectrumID = null,
) {
  const { height, margin, activeSpectrum } = draft;

  if (defaultScale) {
    setAllScales(draft.zoom.spectra, defaultScale);
  }

  if (activeSpectrum === null && spectrumID === null) {
    const zoomManager = Zoom1DManager(draft.zoom.spectra);
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const scale = zoomManager.getScale(id);
      const _scale = scaleLinear(draft.originDomain.yDomains[id], [
        height - margin.bottom,
        margin.top,
      ]);
      const [min, max] = draft.originDomain.yDomains[id];
      const maxPoint = Math.max(Math.abs(max), Math.abs(min));
      const scalePoint = maxPoint === max ? 0 : min;
      const t = zoomIdentity
        .translate(
          0,
          Math.sign(scalePoint) >= 0 ? _scale(scalePoint) : _scale(scalePoint),
        )
        .scale(scale)
        .translate(0, -_scale(0));
      const yDomain = t.rescaleY(_scale).domain();
      acc[id] = yDomain;
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

function setIntegralZoom(scale, draft) {
  if (draft.activeSpectrum) {
    const { height, margin } = draft;
    if (draft.originIntegralYDomain[draft.activeSpectrum.id]) {
      const _scale = scaleLinear(
        draft.originIntegralYDomain[draft.activeSpectrum.id],
        [height - margin.bottom, margin.top],
      );

      const scaleValue = scale < 0.1 ? 0.05 : scale;

      const t = zoomIdentity
        .translate(0, _scale(0))
        .scale(scaleValue)
        .translate(0, -_scale(0));

      const newYDomain = t.rescaleY(_scale).domain();

      const activeSpectrum = draft.activeSpectrum;
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  }
}

export { setZoom, setZoom1D, setIntegralZoom };
