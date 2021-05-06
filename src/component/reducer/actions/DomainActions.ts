import { extent } from 'd3';
import { Draft } from 'immer';
import { xyIntegral } from 'ml-spectra-processing';

import { Datum1D } from '../../../data/data1d/Datum1D';
import { Datum2D } from '../../../data/data2d/Datum2D';
import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

function getActiveData(draft: Draft<State>) {
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

      for (let datum of draft.data) {
        if (data.some((activeData: any) => activeData.id === datum.id)) {
          // AnalysisObj.getDatum(datum.id).isVisibleInDomain = true;
          (datum as Datum2D | Datum1D).display.isVisibleInDomain = true;
        } else {
          // AnalysisObj.getDatum(datum.id).isVisibleInDomain = false;
          (datum as Datum2D | Datum1D).display.isVisibleInDomain = false;
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
    xArray = data.reduce((acc, d: Datum1D) => {
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

    yArray = data.reduce((acc, d: Datum1D) => {
      const { display, data, integrals } = d;
      if (display.isVisibleInDomain) {
        const _extent = extent(data.y);
        yDomains[d.id] = _extent;
        if (integrals.values && integrals.values.length > 0) {
          const values = integrals.values;
          const { from = 0, to = 0 } = values[0];
          const { x, y } = data;
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
    xArray = data.reduce((acc, datum: Datum1D | Datum2D) => {
      if (
        datum.info.dimension === 2 &&
        datum.info.nucleus?.join(',') === activeTab &&
        datum.info.isFt
      ) {
        acc = acc.concat([
          (datum as Datum2D).data.minX,
          (datum as Datum2D).data.maxX,
        ]);
      }
      return acc;
    }, []);

    yArray = data.reduce((acc, datum: Datum1D | Datum2D) => {
      if (
        datum.info.dimension === 2 &&
        datum.info.nucleus?.join(',') === activeTab &&
        datum.info.isFt
      ) {
        acc = acc.concat([
          (datum as Datum2D).data.minY,
          (datum as Datum2D).data.maxY,
        ]);
      }
      return acc;
    }, []);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  const spectrumsIDs = nucleus.map((n) => tabActiveSpectrum[n]?.id);

  const filteredData = data.reduce((acc, datum: Datum1D | Datum2D) => {
    return spectrumsIDs.includes(datum.id) && datum.info.dimension === 1
      ? acc.concat(datum)
      : acc.concat([]);
  }, []);
  try {
    xDomains = filteredData.reduce((acc, d: Datum1D) => {
      const { x } = d.data;
      const domain = [x[0], x[x.length - 1]];
      acc[d.id] = domain;
      return acc;
    }, {});

    yDomains = filteredData.reduce((acc, d: Datum1D) => {
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

function setDomain(draft: Draft<State>, isYDomainChanged = true) {
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
        draft.originDomain = {
          ...domain,
          yDomains: draft.yDomains,
          originYDomains: domain.yDomains,
        };
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

function setOriginalDomain(draft: Draft<State>, originDomain) {
  draft.originDomain = originDomain;
}

function setXDomain(draft: Draft<State>, xDomain) {
  draft.xDomain = xDomain;
}

function setYDomain(draft: Draft<State>, yDomain) {
  draft.yDomain = yDomain;
}

function handelResetDomain(draft: Draft<State>) {
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
  draft.mode = (data[0] as Datum1D)?.info.isFid ? 'LTR' : 'RTL';
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
