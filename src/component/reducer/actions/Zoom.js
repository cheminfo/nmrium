import { zoomIdentity, scaleLinear } from 'd3';

import Spectrum1DZoomHelper from '../helper/Spectrum1DZoomHelper';

export const spectrumZoomHanlder = new Spectrum1DZoomHelper();
export const integralZoomHanlder = new Spectrum1DZoomHelper(0.5);

export const ZoomType = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
  STEP_HROZENTAL: 'STEP_HROZENTAL',
  FULL: 'FULL',
};

const setZoom = (state, draft, scale) => {
  const { height, margin, activeSpectrum } = state;

  draft.zoomFactor = { scale };

  if (activeSpectrum === null) {
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const _scale = scaleLinear(draft.originDomain.yDomains[id], [
        height - margin.bottom,
        margin.top,
      ]);
      const t = zoomIdentity
        .translate(0, _scale(0))
        .scale(scale)
        .translate(0, -_scale(0));

      const yDomain = t.rescaleY(_scale).domain();
      acc[id] = yDomain;
      return acc;
      // return [y[0] + (yDomain[0] - y[0]), y[1] + (yDomain[1] - y[1])];
    }, {});
  } else {
    const _scale = scaleLinear(draft.originDomain.yDomains[activeSpectrum.id], [
      height - margin.bottom,
      margin.top,
    ]);
    const t = zoomIdentity
      .translate(0, _scale(0))
      .scale(scale)
      .translate(0, -_scale(0));

    const yDomain = t.rescaleY(_scale).domain();
    draft.yDomains[activeSpectrum.id] = yDomain;
  }
};
const setZoom1D = (draft, scale, height, margin, index) => {
  const { originDomain, tabActiveSpectrum, activeTab } = draft;

  const { id } = tabActiveSpectrum[activeTab.split(',')[index]];

  draft.zoomFactor = { scale };

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
};

const setIntegralZoom = (state, scale, draft) => {
  if (draft.activeSpectrum) {
    const { height, margin } = state;
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

      draft.integralZoomFactor = { scale };
      const activeSpectrum = draft.activeSpectrum;
      // draft.zoomFactor = t;
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  }
};

export { setZoom, setZoom1D, setIntegralZoom };
