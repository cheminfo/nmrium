import { extent } from 'd3';
import { xyIntegral } from 'ml-spectra-processing';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { DISPLAYER_MODE } from '../core/Constants';

function getActiveData(draft) {
  if (draft.activeTab) {
    const groupByNucleus = GroupByInfoKey('nucleus');
    let data = groupByNucleus(draft.data)[draft.activeTab];
    if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
      return data;
    } else {
      if (draft.activeSpectrum && data) {
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

      for (let index in draft.data) {
        if (data.some((activeData) => activeData.id === draft.data[index].id)) {
          // AnalysisObj.getDatum(datum.id).isVisibleInDomain = true;
          draft.data[index].display.isVisibleInDomain = true;
        } else {
          // AnalysisObj.getDatum(datum.id).isVisibleInDomain = false;
          draft.data[index].display.isVisibleInDomain = false;
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
      const { display, data } = d;
      if (display.isVisibleInDomain) {
        const domain = [data.x[0], data.x[data.x.length - 1]];
        xDomains[d.id] = domain;
        if (display.isVisible) {
          acc = acc.concat(domain);
        }
        return acc;
      } else {
        return acc.concat([]);
      }
    }, []);

    yArray = data.reduce((acc, d) => {
      const { display, data, integrals } = d;
      if (display.isVisibleInDomain) {
        const _extent = extent(data.y);
        yDomains[d.id] = _extent;
        if (integrals.values && integrals.values.length > 0) {
          const values = integrals.values;
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
        if (display.isVisible) {
          acc = acc.concat(_extent);
        }
        return acc;
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
  let xArray = [];
  let yArray = [];
  let yDomains = {};
  let xDomains = {};

  const { activeTab, tabActiveSpectrum, data } = state;

  const nucleus = activeTab.split(',');

  try {
    xArray = data.reduce((acc, datum) => {
      if (datum.info.dimension === 2) {
        acc = acc.concat([datum.data.minX, datum.data.maxX]);
      }
      return acc;
    }, []);

    yArray = data.reduce((acc, datum) => {
      if (
        datum.info.dimension === 2 &&
        datum.info.nucleus.join(',') === activeTab
      ) {
        acc = acc.concat([datum.data.minY, datum.data.maxY]);
      }
      return acc;
    }, []);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

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
      const { x } = d.data;
      const domain = [x[0], x[x.length - 1]];
      acc[d.id] = domain;
      return acc;
    }, {});

    yDomains = filteredData.reduce((acc, d) => {
      const _extent = extent(d.data.y);
      acc[d.id] = _extent;
      return acc;
    }, {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  return {
    xDomain: extent(xArray),
    yDomain: extent(yArray),
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

      if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
        draft.yDomains = Object.keys(domain.yDomains).reduce((acc, key) => {
          acc[key] = domain.yDomain;
          return acc;
        }, {});
        draft.originDomain = { ...domain, yDomains: draft.yDomains };
      } else {
        draft.yDomains = domain.yDomains;
        draft.originDomain = domain;
      }

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
  }
}

function setOriginalDomain(draft, originDomain) {
  draft.originDomain = originDomain;
}

function setXDomain(draft, xDomain) {
  draft.xDomain = xDomain;
}

function setYDomain(draft, yDomain) {
  draft.yDomain = yDomain;
}

function handelResetDomain(draft) {
  const { xDomain, yDomain, xDomains, yDomains } = draft.originDomain;
  draft.xDomain = xDomain;
  draft.yDomain = yDomain;
  draft.xDomains = xDomains;
  draft.yDomains = yDomains;
}

function setMode(draft) {
  const data = getActiveData(draft).filter(
    (datum) => datum.display.isVisibleInDomain === true,
  );
  draft.mode = data && data[0] && data[0].info.isFid ? 'LTR' : 'RTL';
}

function handleChangeIntegralYDomain(draft, newYDomain) {
  const activeSpectrum = draft.activeSpectrum;
  if (activeSpectrum) {
    draft.integralsYDomains[activeSpectrum.id] = newYDomain;
  }
}

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
