import { zoomIdentity, scaleLinear } from 'd3';

import getClosestNumber from '../helper/GetClosestNumber';
import Spectrum1DZoomHelper from '../helper/Spectrum1DZoomHelper';

import { getScale } from './ScaleActions';

export const spectrumZoomHanlder = new Spectrum1DZoomHelper();
export const integralZoomHanlder = new Spectrum1DZoomHelper(0.5);

const setZoom = (state, draft, scale) => {
  const { height, margin, data } = state;
  let t;
  if (data.length === 1) {
    const closest = getClosestNumber(data[0].y);
    const referencePoint = getScale(state).y(closest);
    t = zoomIdentity
      .translate(0, referencePoint)
      .scale(scale)
      .translate(0, -referencePoint);
  } else {
    t = zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(scale)
      .translate(0, -(height - margin.bottom));
  }

  draft.zoomFactor = { scale };

  if (draft.activeSpectrum === null) {
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
      const _scale = scaleLinear(draft.originDomain.yDomains[id], [
        height - margin.bottom,
        margin.top,
      ]);
      let yDomain = t.rescaleY(_scale).domain();
      acc[id] = yDomain;
      return acc;
      // return [y[0] + (yDomain[0] - y[0]), y[1] + (yDomain[1] - y[1])];
    }, {});
  } else {
    const _scale = scaleLinear(
      draft.originDomain.yDomains[draft.activeSpectrum.id],
      [height - margin.bottom, margin.top],
    );
    let yDomain = t.rescaleY(_scale).domain();
    draft.yDomains[draft.activeSpectrum.id] = yDomain;
  }
};
const setZoom1D = (draft, scale, height, margin, index) => {
  const { originDomain, data, tabActiveSpectrum, activeTab } = draft;
  const { id, index: spectrumIndex } = tabActiveSpectrum[
    activeTab.split(',')[index]
  ];
  const scaleY = scaleLinear(draft.yDomains[id], [height - margin, margin]);

  let t;
  const closest = getClosestNumber(data[spectrumIndex].y);
  const referencePoint = scaleY(closest);
  t = zoomIdentity
    .translate(0, referencePoint)
    .scale(scale)
    .translate(0, -referencePoint);

  draft.zoomFactor = { scale };

  const _scale = scaleLinear(originDomain.yDomains[id], [
    height - margin,
    margin,
  ]);
  let yDomain = t.rescaleY(_scale).domain();
  draft.yDomains[id] = yDomain;
};

const setIntegralZoom = (state, scale, draft) => {
  if (draft.activeSpectrum) {
    const { height, margin } = state;
    if (draft.originIntegralYDomain) {
      const _scale = scaleLinear(draft.originIntegralYDomain, [
        height - margin.bottom,
        margin.top,
      ]);

      const scaleValue = scale < 0.1 ? 0.05 : scale;

      const t = zoomIdentity
        .translate(0, height - margin.bottom)
        .scale(scaleValue)
        .translate(0, -(height - margin.bottom));

      const newYDomain = t.rescaleY(_scale).domain();

      draft.integralZoomFactor = { scale };
      const activeSpectrum = draft.activeSpectrum;
      // draft.zoomFactor = t;
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  }
};

export { setZoom, setZoom1D, setIntegralZoom };
