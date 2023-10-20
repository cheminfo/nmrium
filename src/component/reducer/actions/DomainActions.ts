import type { NmrData2DFt, NmrData2DFid } from 'cheminfo-types';
import { extent } from 'd3';
import { Draft } from 'immer';
import { Spectrum1D, Spectrum2D } from 'nmr-load-save';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { addToBrushHistory } from '../helper/ZoomHistoryManager';
import { getActiveSpectra } from '../helper/getActiveSpectra';
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
type MoveXAxisAction = ActionType<'MOVE', { shiftX: number; shiftY: number }>;

export type DomainActions =
  | SetXDomainAction
  | SetYDomainAction
  | MoveXAxisAction;

function getActiveData(draft: Draft<State>): Spectrum1D[] {
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

  return data as Spectrum1D[];
}

function getDomain(draft: Draft<State>) {
  let xArray: number[] = [];
  let yArray: number[] = [];
  const yDomains: Record<string, number[]> = {};
  const xDomains: Record<string, number[]> = {};

  const data = getActiveData(draft);
  try {
    for (const d of data) {
      const { display, data, id } = d;
      const { y } = get1DDataXY(d);

      const _extent = extent(y) as number[];
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
  let xArray: number[] = [];
  let yArray: number[] = [];
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
    const { minX, maxX, minY, maxY } = (spectrum.data as NmrData2DFid).re;
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
        ) as Spectrum2D[]
      ).flatMap((datum: Spectrum2D) => {
        const { minX, maxX } = (datum.data as NmrData2DFt).rr;
        return [minX, maxX];
      });

      yArray = (
        data.filter(
          (d) =>
            isSpectrum2D(d) &&
            d.info.nucleus?.join(',') === activeTab &&
            d.info.isFt,
        ) as Spectrum2D[]
      ).flatMap((datum: Spectrum2D) => {
        const { minY, maxY } = (datum.data as NmrData2DFt).rr;
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
    if (draft.displayerMode === '1D') {
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
      if (draft.displayerMode === '1D' && isYDomainShared) {
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

function setMode(draft: Draft<State>) {
  const { xDomains, view, data, displayerMode } = draft;
  const nuclues = view.spectra.activeTab;

  if (displayerMode === '1D') {
    const datum_ = data.find(
      (datum) =>
        xDomains[datum.id] && nucleusToString(datum.info.nucleus) === nuclues,
    );
    draft.mode = (datum_ as Spectrum1D)?.info.isFid ? 'LTR' : 'RTL';
  } else {
    const activeSpectra = getActiveSpectra(draft);
    let hasFt = false;
    if (Array.isArray(activeSpectra) && activeSpectra?.length > 0) {
      hasFt = activeSpectra.some(
        (spectrum) => !data[spectrum.index].info.isFid,
      );
    } else {
      hasFt = data.some(
        (spectrum) =>
          !spectrum.info.isFid &&
          nucleusToString(spectrum.info.nucleus) === nuclues,
      );
    }

    draft.mode = hasFt ? 'RTL' : 'LTR';
  }
}

//action
function handleSetXDomain(draft: Draft<State>, action: SetXDomainAction) {
  const xDomain = action.payload.xDomain;
  draft.xDomain = xDomain;
  addToBrushHistory(draft, { xDomain, yDomain: draft.yDomain });
}

//action
function handleSetYDomain(draft: Draft<State>, action: SetYDomainAction) {
  const yDomain = action.payload.yDomain;
  draft.yDomain = yDomain;
  addToBrushHistory(draft, { xDomain: draft.xDomain, yDomain });
}

function handleMoveOverXAxis(draft: Draft<State>, action: MoveXAxisAction) {
  const { shiftX, shiftY } = action.payload;
  const [x1, x2] = draft.xDomain;
  const [y1, y2] = draft.yDomain;
  const [x1Origin, x2Origin] = draft.originDomain.xDomain;
  const [y1Origin, y2Origin] = draft.originDomain.yDomain;
  let x1Domain = x1 - shiftX;
  let x2Domain = x2 - shiftX;
  let y1Domain = y1 - shiftY;
  let y2Domain = y2 - shiftY;

  if (x1Domain < x1Origin) {
    x1Domain = x1Origin;
    x2Domain = x2;
  }
  if (x2Domain > x2Origin) {
    x2Domain = x2Origin;
    x1Domain = x1;
  }
  if (y1Domain < y1Origin) {
    y1Domain = y1Origin;
    y2Domain = y2;
  }
  if (y2Domain > y2Origin) {
    y2Domain = y2Origin;
    y1Domain = y1;
  }

  draft.xDomain = [x1Domain, x2Domain];
  draft.yDomain = [y1Domain, y2Domain];
}

export {
  getDomain,
  setDomain,
  setMode,
  handleSetXDomain,
  handleSetYDomain,
  handleMoveOverXAxis,
};
