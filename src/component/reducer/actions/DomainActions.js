import { extent } from 'd3';
import { produce } from 'immer';
import { xyIntegral } from 'ml-spectra-processing';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { AnalysisObj } from '../core/Analysis';
import { DISPLAYER_MODE } from '../core/Constants';

function getActiveData(draft) {
  if (draft.activeTab) {
    const groupByNucleus = GroupByInfoKey('nucleus');
    let data = groupByNucleus(draft.data)[draft.activeTab];
    // draft.activeSpectrum = null;
    if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
      return data;
    } else {
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
    }
  } else {
    return draft.data;
  }
}

function getDomain(data) {
  let xArray = [];
  let yArray = [];
  let yDomains = {};
  let xDomains = {};
  let integralYDomain = {};
  try {
    xArray = data.reduce((acc, d) => {
      if (d.isVisibleInDomain) {
        const domain = [d.x[0], d.x[d.x.length - 1]];
        xDomains[d.id] = domain;

        return acc.concat(domain);
      } else {
        return acc.concat([]);
      }
    }, []);

    yArray = data.reduce((acc, d) => {
      if (d.isVisibleInDomain) {
        const _extent = extent(d.y);
        yDomains[d.id] = _extent;
        if (d.integrals.values && d.integrals.values.length > 0) {
          const values = d.integrals.values;
          const { from, to } = values[0];
          const { x, y } = d;
          const integralResult = xyIntegral(
            { x: x, y: y },
            {
              from: from,
              to: to,
              reverse: true,
            },
          );
          integralYDomain[d.id] = extent(integralResult.y);
        }
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
    xDomain: extent(xArray),
    yDomain: extent(yArray),
    yDomains,
    xDomains,
    integralYDomain,
  };
}
function get2DDomain(state) {
  let yDomains = {};
  let xDomains = {};

  const { activeTab, tabActiveSpectrum, data } = state;
  const nucleus = activeTab.split(',');
  const { minX, maxX, minY, maxY } = data.find(
    (datum) => datum.id === tabActiveSpectrum[activeTab].id,
  );

  const spectrumsIDs = nucleus.map(
    (n) => tabActiveSpectrum[n] && tabActiveSpectrum[n].id,
  );
  const filteredData = data.reduce((acc, datum) => {
    return spectrumsIDs.includes(datum.id) && datum.info.dimension === 1
      ? acc.concat(datum)
      : acc.concat([]);
  }, []);
  try {
    xDomains = filteredData.reduce((acc, d) => {
      const domain = [d.x[0], d.x[d.x.length - 1]];
      acc[d.id] = domain;
      return acc;
    }, {});

    yDomains = filteredData.reduce((acc, d) => {
      const _extent = extent(d.y);
      acc[d.id] = _extent;
      return acc;
    }, {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  return {
    xDomain: [minX, maxX],
    yDomain: [minY, maxY],
    yDomains,
    xDomains,
  };
}

function setDomain(draft, isYDomainChanged = true) {
  let domain;
  const data = getActiveData(draft);

  if (
    draft.activeTab &&
    [DISPLAYER_MODE.DM_1D, DISPLAYER_MODE.DM_2D].includes(draft.displayerMode)
  ) {
    domain =
      draft.displayerMode === DISPLAYER_MODE.DM_1D
        ? getDomain(data)
        : get2DDomain(draft);
    draft.xDomain = domain.xDomain;
    draft.xDomains = domain.xDomains;
    if (isYDomainChanged) {
      draft.yDomain = domain.yDomain;
      draft.yDomains = domain.yDomains;
      draft.originDomain = domain;
      draft.integralsYDomains =
        domain.integralYDomain && domain.integralYDomain;
      draft.originIntegralYDomain =
        domain.integralYDomain && domain.integralYDomain;
    } else {
      draft.originDomain = {
        ...draft.originDomain,
        xDomain: domain.xDomain,
        xDomains: domain.xDomains,
      };
    }
    // draft.integralsYDomains = domain.integralsYDomains;
    // draft.data = draft.data.map((d) => {
    //   return { ...d, integralsYDomain: domain.y };
    // });
  }
  // else {
  //   domain = getDomain(data);
  //   console.log(domain)

  //   // console.log(domain);
  //   draft.xDomain = domain.x;
  //   draft.yDomain = domain.y;
  //   draft.originDomain = domain;
  //   draft.yDomains = domain.yDomains;
  // }
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

const setYDomain = (state, yDomain) => {
  return produce(state, (draft) => {
    draft.yDomain = yDomain;
  });
};

const handelResetDomain = (state) => {
  return produce(state, (draft) => {
    const { xDomain, yDomain, xDomains, yDomains } = state.originDomain;
    draft.xDomain = xDomain;
    draft.yDomain = yDomain;
    draft.xDomains = xDomains;
    draft.yDomains = yDomains;
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
  setYDomain,
  handelResetDomain,
  setDomain,
  setMode,
  handleChangeIntegralYDomain,
};
