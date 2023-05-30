import type { Data2DFt, Data2DFid } from 'cheminfo-types';
import { extent } from 'd3';
import { Draft } from 'immer';
import type { Spectrum1D, Spectrum2D } from 'nmr-processing';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import { ActionType } from '../types/ActionType';

type SetXDomainAction = ActionType<
  'SET_X_DOMAIN',
  { xDomain: [number, number] }
>;
type SetYDomainAction = ActionType<
  'SET_Y_DOMAIN',
  { yDomain: [number, number] }
>;

export type DomainActions = SetXDomainAction | SetYDomainAction;

function getActiveData(draft: Draft<State>): Array<Spectrum1D> {
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

  return data as Array<Spectrum1D>;
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
      const domain = [data.x[0], data.x.at(-1) as number];

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
  const yDomains: Record<string, [number, number] | [undefined, undefined]> =
    {};
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
    const { minX, maxX, minY, maxY } = (spectrum.data as Data2DFid).re;
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
        ) as Array<Spectrum2D>
      ).flatMap((datum: Spectrum2D) => {
        const { minX, maxX } = (datum.data as Data2DFt).rr;
        return [minX, maxX];
      });

      yArray = (
        data.filter(
          (d) =>
            isSpectrum2D(d) &&
            d.info.nucleus?.join(',') === activeTab &&
            d.info.isFt,
        ) as Array<Spectrum2D>
      ).flatMap((datum: Spectrum2D) => {
        const { minY, maxY } = (datum.data as Data2DFt).rr;
        return [minY, maxY];
      });
    } catch (error) {
      // TODO: handle error
      reportError(error);
    }
  }

  const spectrumsIDs = new Set();

  for (const n of nucleus) {
    const spectra = activeSpectra[n];
    if (spectra?.length === 1) {
      spectrumsIDs.add(spectra[0].id);
    }
  }

  const filteredData = data
    .filter((d) => spectrumsIDs.has(d.id) && d.info.dimension === 1)
    .map((datum) => {
      return datum as Spectrum1D;
    });

  try {
    for (const d of filteredData) {
      const { x, re } = d.data;
      const domain = [x[0], x.at(-1) as number];
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
  updateYDomain?: boolean;
  isYDomainShared?: boolean;
  updateXDomain?: boolean;
}

function setDomain(draft: Draft<State>, options?: SetDomainOptions) {
  const {
    updateYDomain = true,
    isYDomainShared = true,
    updateXDomain = true,
  } = options || {};
  let domain;

  if (draft.view.spectra.activeTab) {
    if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
      domain = getDomain(draft);
    } else {
      domain = get2DDomain(draft);
    }

    if (updateXDomain) {
      draft.xDomain = domain.xDomain;
      draft.xDomains = domain.xDomains;
    }
    // draft.originDomain = domain;

    if (updateYDomain) {
      draft.yDomain = domain.yDomain;
      if (draft.displayerMode === DISPLAYER_MODE.DM_1D && isYDomainShared) {
        draft.yDomains = Object.fromEntries(
          Object.keys(domain.yDomains).map((key) => {
            return [key, domain.yDomain];
          }),
        );
      } else {
        draft.yDomains = domain.yDomains;
      }
    }

    draft.originDomain = {
      ...draft.originDomain,
      ...(updateXDomain && {
        xDomain: domain.xDomain,
        xDomains: domain.xDomains,
      }),
      ...(updateYDomain && {
        yDomain: domain.yDomain,
        yDomains: domain.yDomains,
      }),
    };
  }
}

function getSpectrumIntegralsDomain(datum: Spectrum1D) {
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
function setIntegralsYDomain(
  draft: Draft<State>,
  data: Spectrum1D[] | Spectrum1D,
) {
  for (const spectrum of Array.isArray(data) ? data : [data]) {
    if (spectrum?.info?.dimension === 1) {
      draft.integralsYDomains[spectrum.id] =
        getSpectrumIntegralsDomain(spectrum);
    }
  }
}

function setMode(draft: Draft<State>) {
  const datum_ = draft.data.find(
    (datum) =>
      draft.xDomains[datum.id] &&
      nucleusToString(datum.info.nucleus) === draft.view.spectra.activeTab,
  );
  draft.mode = (datum_ as Spectrum1D)?.info.isFid ? 'LTR' : 'RTL';
}

//action
function handleSetXDomain(draft: Draft<State>, action: SetXDomainAction) {
  const xDomain = action.payload.xDomain;
  draft.xDomain = xDomain;
}

//action
function handleSetYDomain(draft: Draft<State>, action: SetYDomainAction) {
  const yDomain = action.payload.yDomain;
  draft.yDomain = yDomain;
}

export {
  getDomain,
  setDomain,
  setMode,
  setIntegralsYDomain,
  handleSetXDomain,
  handleSetYDomain,
};
