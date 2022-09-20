import { extent } from 'd3';
import { Draft } from 'immer';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D';
import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

function getActiveData(draft: Draft<State>): Array<Datum1D> {
  let data = draft.data.filter(
    (datum) =>
      nucleusToString(datum.info.nucleus) === draft.view.spectra.activeTab &&
      datum.info.dimension === 1,
  );
  const activeSpectrum =
    draft.view.spectra.activeSpectra[draft.view.spectra.activeTab];
  if (activeSpectrum) {
    const activeSpectrumIndex = data.findIndex(
      (datum) => datum.id === activeSpectrum?.id,
    );
    if (activeSpectrumIndex !== -1) {
      const isFid = data[activeSpectrumIndex].info.isFid || false;
      data = data.filter((datum) => datum.info.isFid === isFid);
    }
  } else {
    data = data.filter((datum) => !datum.info.isFid);
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
      const { display, data } = d;
      const domain = [data.x[0], data.x[data.x.length - 1]];
      xDomains[d.id] = domain;
      if (display.isVisible) {
        acc = acc.concat(domain);
      }
      return acc;
    }, []);

    yArray = data.reduce<Array<number>>((acc, d: Datum1D) => {
      const { display } = d;
      const data = get1DDataXY(d);

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
function get2DDomain(state: State) {
  let xArray = [];
  let yArray = [];
  let yDomains = {};
  let xDomains = {};

  const {
    view: {
      spectra: { activeSpectra, activeTab },
    },
    data,
  } = state;

  const nucleus = activeTab.split(',');

  try {
    xArray = data.reduce((acc: any, datum: Datum1D | Datum2D) => {
      if (
        isSpectrum2D(datum) &&
        datum.info.nucleus?.join(',') === activeTab &&
        datum.info.isFt
      ) {
        acc = acc.concat([datum.data.minX, datum.data.maxX]);
      }
      return acc;
    }, []);

    yArray = data.reduce((acc: any, datum: Datum1D | Datum2D) => {
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

  const spectrumsIDs = nucleus.map((n) => activeSpectra[n]?.id);

  const filteredData = data.reduce((acc: any, datum: Datum1D | Datum2D) => {
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
      const _extent = extent(d.data.re);
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

export interface SetDomainOptions {
  yDomain?: {
    isChanged?: boolean;
    isShared?: boolean;
  };
}

function setDomain(draft: Draft<State>, options?: SetDomainOptions) {
  const { yDomain = { isChanged: true, isShared: true } } = options || {};
  let domain;

  if (draft.view.spectra.activeTab) {
    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      domain = getDomain(draft);
    } else {
      domain = get2DDomain(draft);
    }
    draft.xDomain = domain.xDomain;
    draft.xDomains = domain.xDomains;
    draft.originDomain = domain;

    if (yDomain.isChanged) {
      draft.yDomain = domain.yDomain;
      if (draft.displayerMode === DISPLAYER_MODE.DM_1D && yDomain.isShared) {
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

function getSpectrumIntegralsDomain(datum: Datum1D) {
  const { integrals, ranges } = datum;
  let max = Number.NEGATIVE_INFINITY;
  for (const integral of integrals.values) {
    max = Math.max(max, integral.absolute);
  }
  for (const range of ranges.values) {
    max = Math.max(max, range.absolute);
  }
  return [0, max];
}
function setIntegralsYDomain(draft: Draft<State>, data: Datum1D[] | Datum1D) {
  for (const spectrum of Array.isArray(data) ? data : [data]) {
    if (spectrum?.info?.dimension === 1) {
      draft.integralsYDomains[spectrum.id] =
        getSpectrumIntegralsDomain(spectrum);
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
      nucleusToString(datum.info.nucleus) === draft.view.spectra.activeTab,
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
  setIntegralsYDomain,
};
