import { extent } from 'd3';
import { Draft } from 'immer';

import { Datum1D } from '../../../data/data1d/Spectrum1D';
import { Datum2D, isSpectrum2D } from '../../../data/data2d/Spectrum2D';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

function getActiveData(draft: Draft<State>): Array<Datum1D> {
  let data = draft.data.filter(
    (datum) =>
      nucleusToString(datum.info.nucleus) === draft.activeTab &&
      datum.info.dimension === 1,
  );

  if (draft.activeSpectrum) {
    const activeSpectrumIndex = data.findIndex(
      (datum) => datum.id === draft.activeSpectrum?.id,
    );
    if (activeSpectrumIndex !== -1) {
      const isFid = data[activeSpectrumIndex].info.isFid || false;
      data = data.filter((datum) => datum.info.isFid === isFid);
    }
  } else {
    data = data.filter((datum) => datum.info.isFid === false);
  }

  return data as Array<Datum1D>;
}

function getDomain(drfat: Draft<State>) {
  let xArray: Array<number> = [];
  let yArray: Array<number> = [];
  let yDomains = {};
  let xDomains = {};

  const data = getActiveData(drfat);
  try {
    xArray = data.reduce<Array<number>>((acc, d: Datum1D) => {
      const { display, data: datum } = d;
      const domain = [datum.x[0], datum.x[datum.x.length - 1]];
      xDomains[d.id] = domain;
      if (display.isVisible) {
        acc = acc.concat(domain);
      }
      return acc;
    }, []);

    yArray = data.reduce<Array<number>>((acc, d: Datum1D) => {
      const { display, data } = d;
      const _extent = extent(data.y) as Array<number>;
      yDomains[d.id] = _extent;

      if (display.isVisible) {
        acc = acc.concat(_extent);
      }
      return acc;
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
        isSpectrum2D(datum) &&
        datum.info.nucleus?.join(',') === activeTab &&
        datum.info.isFt
      ) {
        acc = acc.concat([datum.data.minX, datum.data.maxX]);
      }
      return acc;
    }, []);

    yArray = data.reduce((acc, datum: Datum1D | Datum2D) => {
      if (
        isSpectrum2D(datum) &&
        datum.info.nucleus?.join(',') === activeTab &&
        datum.info.isFt
      ) {
        acc = acc.concat([datum.data.minY, datum.data.maxY]);
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

  if (draft.activeTab) {
    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      domain = getDomain(draft);
    } else {
      domain = get2DDomain(draft);
    }
    draft.xDomain = domain.xDomain;
    draft.xDomains = domain.xDomains;
    draft.originDomain = domain;

    if (isYDomainChanged) {
      draft.yDomain = domain.yDomain;
      if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
        draft.yDomains = Object.keys(domain.yDomains).reduce((acc, key) => {
          acc[key] = domain.yDomain;
          return acc;
        }, {});
      } else {
        draft.yDomains = domain.yDomains;
      }
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

function setMode(draft: Draft<State>) {
  const data = draft.data.filter(
    (datum) =>
      draft.xDomains[datum.id] &&
      nucleusToString(datum.info.nucleus) === draft.activeTab,
  );
  draft.mode = (data[0] as Datum1D)?.info.isFid ? 'LTR' : 'RTL';
}

export {
  getDomain,
  setOriginalDomain,
  setXDomain,
  setYDomain,
  handelResetDomain,
  setDomain,
  setMode,
};
