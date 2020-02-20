import { produce } from 'immer';
import { extent } from 'd3';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';

function getActiveData(draft) {
  if (draft.activeTab) {
    const groupByNucleus = GroupByInfoKey('nucleus');
    let data = groupByNucleus(draft.data)[draft.activeTab];
    // draft.activeSpectrum = null;
    if (draft.activeSpectrum) {
      const activeSpectrumIndex = data.findIndex(
        (datum) => datum.id === draft.activeSpectrum.id,
      );
      if (activeSpectrumIndex !== -1) {
        const isFid = data[activeSpectrumIndex].info.isFid || false;
        data = data.filter((datum) => datum.info.isFid === isFid);
      }
    } else {
      data = data ? data.filter((datum) => datum.info.isFid === false) : [];
    }

    for (let datum of draft.data) {
      if (data.some((activeData) => activeData.id === datum.id)) {
        AnalysisObj.getDatum(datum.id).isVisibleInDomain = true;
        datum.isVisibleInDomain = true;
      } else {
        AnalysisObj.getDatum(datum.id).isVisibleInDomain = false;
        datum.isVisibleInDomain = false;
      }
    }
    return draft.data;
  } else {
    return draft.data;
  }
}

function getDomain(data) {
  let xArray = [];
  let yArray = [];
  let yDomains = {};
  try {
    xArray = data.reduce((acc, d) => {
      return d.isVisibleInDomain
        ? acc.concat([d.x[0], d.x[d.x.length - 1]])
        : acc.concat([]);
    }, []);
    yDomains = {};
    yArray = data.reduce((acc, d) => {
      if (d.isVisibleInDomain) {
        const _extent = extent(d.y);
        yDomains[d.id] = _extent;

        return acc.concat(_extent);
      } else {
        return acc.concat([]);
      }
    }, []);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  return {
    x: extent(xArray),
    y: extent(yArray),
    yDomains,
  };
}

function setDomain(draft, isYDomainChanged = true) {
  let domain;
  const data = getActiveData(draft);

  if (draft.activeTab) {
    domain = getDomain(data);
    draft.xDomain = domain.x;
    if (isYDomainChanged) {
      draft.yDomain = domain.y;
      draft.yDomains = domain.yDomains;
      draft.originDomain = {
        x: domain.x,
        y: domain.y,
        yDomains: domain.yDomains,
      };
    } else {
      draft.originDomain = {
        ...draft.originDomain,
        x: domain.x,
      };
    }
    // draft.integralsYDomains = domain.integralsYDomains;
    // draft.data = draft.data.map((d) => {
    //   return { ...d, integralsYDomain: domain.y };
    // });
  } else {
    domain = getDomain(data);
    // console.log(domain);
    draft.xDomain = domain.x;
    draft.yDomain = domain.y;
    draft.originDomain = domain;
    draft.yDomains = domain.yDomains;
  }
}

const setOriginalDomain = (state, originDomain) => {
  return produce(state, (draft) => {
    draft.originDomain = originDomain;
  });
};

const setXDomain = (state, xDomain) => {
  return produce(state, (draft) => {
    draft.xDomain = xDomain;
  });
};

const handelResetDomain = (state) => {
  return produce(state, (draft) => {
    draft.xDomain = state.originDomain.x;
    draft.yDomain = state.originDomain.y;
  });
};

function setMode(draft) {
  const data = getActiveData(draft).filter(
    (datum) => datum.isVisibleInDomain === true,
  );
  draft.mode = data && data[0] && data[0].info.isFid ? 'LTR' : 'RTL';
}

const handleChangeIntegralYDomain = (state, newYDomain) => {
  return produce(state, (draft) => {
    const activeSpectrum = draft.activeSpectrum;
    if (activeSpectrum) {
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  });
};

export {
  getDomain,
  setOriginalDomain,
  setXDomain,
  handelResetDomain,
  setDomain,
  setMode,
  handleChangeIntegralYDomain,
};
