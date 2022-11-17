import { extent } from 'd3';
import { Draft } from 'immer';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D';
import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';

function getActiveData(draft: Draft<State>): Array<Datum1D> {
  let data = draft.data.filter(
    (datum) =>
      nucleusToString(datum.info.nucleus) === draft.view.spectra.activeTab &&
      datum.info.dimension === 1,
  );
  // todo: refactor this

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
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

function getDomain(draft: Draft<State>) {
  let xArray: Array<number> = [];
  let yArray: Array<number> = [];
  const yDomains: Record<string, number[]> = {};
  const xDomains: Record<string, number[]> = {};

  const data = getActiveData(draft);
  try {
    for (const d of data) {
      const { display, data, id } = d;
      const { y } = get1DDataXY(d);

      const _extent = extent(y) as Array<number>;
      const domain = [data.x[0], data.x[data.x.length - 1]];

      yDomains[id] = _extent;
      xDomains[id] = domain;
      if (display.isVisible) {
        xArray = xArray.concat(domain);
        yArray = yArray.concat(_extent);
      }
    }
  } catch (error) {
    // TODO: handle error.
    reportError(error);
  }

  return {
    xDomain: extent(xArray),
    yDomain: extent(yArray),
    yDomains,
    xDomains,
  };
}
function get2DDomain(state: State) {
  let xArray: Array<number> = [];
  let yArray: Array<number> = [];
  const yDomains: Record<string, [number | undefined, number | undefined]> = {};
  const xDomains: Record<string, number[]> = {};

  const {
    view: {
      spectra: { activeSpectra, activeTab },
    },
    data,
  } = state;

  const nucleus = activeTab.split(',');
  const activeSpectrum = getActiveSpectrum(state);
  const spectrum =
    data.find((datum) => datum.id === activeSpectrum?.id) || null;
  if (spectrum?.info.isFid) {
    const { minX, maxX, minY, maxY } = (spectrum as Datum2D).data;
    xArray = [minX, maxX];
    yArray = [minY, maxY];
  } else {
    try {
      xArray = (
        data.filter(
          (datum) =>
            isSpectrum2D(datum) &&
            datum.info.nucleus?.join(',') === activeTab &&
            datum.info.isFt,
        ) as Array<Datum2D>
      ).flatMap((datum: Datum2D) => {
        return [datum.data.minX, datum.data.maxX];
      });

      yArray = (
        data.filter(
          (d) =>
            isSpectrum2D(d) &&
            d.info.nucleus?.join(',') === activeTab &&
            d.info.isFt,
        ) as Array<Datum2D>
      ).flatMap((datum: Datum2D) => {
        return [datum.data.minY, datum.data.maxY];
      });
    } catch (error) {
      // TODO: handle error
      reportError(error);
    }
  }

  const spectrumsIDs = new Set(nucleus.map((n) => activeSpectra[n]?.id));

  const filteredData = data
    .filter((d) => spectrumsIDs.has(d.id) && d.info.dimension === 1)
    .map((datum: Datum1D | Datum2D) => {
      return datum as Datum1D;
    });

  try {
    for (const d of filteredData) {
      const { x, re } = d.data;
      const domain = [x[0], x[x.length - 1]];
      xDomains[d.id] = domain;
      const _extent = extent(re);
      yDomains[d.id] = _extent;
    }
  } catch (error) {
    // TODO: handle error.
    reportError(error);
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
        draft.yDomains = Object.fromEntries(
          Object.keys(domain.yDomains).map((key) => {
            return [key, domain.yDomain];
          }),
        );
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
  const datum_ = draft.data.find(
    (datum) =>
      draft.xDomains[datum.id] &&
      nucleusToString(datum.info.nucleus) === draft.view.spectra.activeTab,
  );
  draft.mode = (datum_ as Datum1D)?.info.isFid ? 'LTR' : 'RTL';
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
