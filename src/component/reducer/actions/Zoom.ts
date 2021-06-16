import { zoomIdentity, scaleLinear } from 'd3';

import Spectrum1DZoomHelper from '../helper/Spectrum1DZoomHelper';

export const spectraZoomHanlders = {};
export const integralZoomHanlder = new Spectrum1DZoomHelper(0.5);

export const ZoomType = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
  STEP_HROZENTAL: 'STEP_HROZENTAL',
  FULL: 'FULL',
};

export function initZoom1DHandler(data) {
  data.forEach((datum) => {
    if (!spectraZoomHanlders[datum.id] && datum.info.dimension === 1) {
      spectraZoomHanlders[datum.id] = new Spectrum1DZoomHelper();
    }
  });
}

export function wheel(
  deltaY,
  deltaMode,
  { data, activeSpectrum, activeTab },
  id = null,
) {
  if (activeSpectrum || id) {
    spectraZoomHanlders[id ? id : activeSpectrum.id].wheel(deltaY, deltaMode);
  } else {
    data.forEach((datum) => {
      if (datum.info.dimension === 1 && activeTab === datum.info.nucleus) {
        spectraZoomHanlders[datum.id].wheel(deltaY, deltaMode);
      }
    });
  }
}
export function getScaleByID(id: number) {
  return { [id]: spectraZoomHanlders[id].getScale(id) };
}

export function getScale({ data, activeTab }) {
  return data.reduce((acc, datum) => {
    if (datum.info.dimension === 1 && activeTab === datum.info.nucleus) {
      acc[datum.id] = spectraZoomHanlders[datum.id].getScale();
    }
    return acc;
  }, {});
}

export function setScale(scale) {
  if (typeof scale === 'number') {
    Object.keys(spectraZoomHanlders).forEach((id) => {
      spectraZoomHanlders[id].setScale(scale);
    });
  } else if (typeof scale === 'object') {
    Object.keys(scale).forEach((id) => {
      spectraZoomHanlders[id].setScale(scale[id]);
    });
  } else {
    throw Error('scale must be number or Object');
  }
}
/**
 *
 * @param {Draft} draft
 * @param {number} defaultScale
 * @param {string | null } [spectrumID = null]
 * @param {boolean} [useOrigin = false]
 */
function setZoom(draft, defaultScale = null, spectrumID = null) {
  const { height, margin, activeSpectrum } = draft;
  if (defaultScale) {
    setScale(defaultScale);
  }
  const scale = getScale(draft);
  draft.zoomFactor = { scale };

  if (activeSpectrum === null && spectrumID === null) {
    draft.yDomains = Object.keys(draft.yDomains).reduce((acc, id) => {
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
        .scale(scale[id])
        .translate(0, -_scale(0));
      const yDomain = t.rescaleY(_scale).domain();
      acc[id] = yDomain;
      return acc;
    }, {});
  } else {
    const spectrumId = spectrumID ? spectrumID : activeSpectrum.id;
    const _scale = scaleLinear(draft.originDomain.yDomains[spectrumId], [
      height - margin.bottom,
      margin.top,
    ]);

    const t = zoomIdentity
      .translate(0, _scale(0))
      .scale(scale[spectrumId])
      .translate(0, -_scale(0));

    const yDomain = t.rescaleY(_scale).domain();
    draft.yDomains = {
      ...draft.yDomains,
      [spectrumId]: yDomain,
    };
  }
}

function setZoom1D(draft, height, margin, index, defaultScale = null) {
  const { originDomain, tabActiveSpectrum, activeTab } = draft;

  const { id } = tabActiveSpectrum[activeTab.split(',')[index]];
  if (defaultScale) {
    setScale(defaultScale);
  }
  const scale = getScaleByID(id);
  draft.zoomFactor = { scale };

  const _scale = scaleLinear(originDomain.yDomains[id], [
    height - margin,
    margin,
  ]);
  const t = zoomIdentity
    .translate(0, _scale(0))
    .scale(scale[id])
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

      draft.integralZoomFactor = { scale };
      const activeSpectrum = draft.activeSpectrum;
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  }
}

export { setZoom, setZoom1D, setIntegralZoom };
