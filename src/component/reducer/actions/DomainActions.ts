import type {
  NucleiPreferences,
  Spectrum,
  Spectrum1D,
  Spectrum2D,
} from '@zakodium/nmrium-core';
import type { NmrData2DFt } from 'cheminfo-types';
import type { Numeric } from 'd3';
import { extent } from 'd3';
import type { Draft } from 'immer';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY.js';
import {
  isFid1DSpectrum,
  isFt1DSpectrum,
} from '../../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/index.js';
import {
  isFid2DData,
  isFt2DSpectrum,
} from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import nucleusToString from '../../utility/nucleusToString.js';
import type { State } from '../Reducer.js';
import { addToBrushHistory } from '../helper/ZoomHistoryManager.js';
import { getActiveSpectra } from '../helper/getActiveSpectra.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import type { ActionType } from '../types/ActionType.js';

type SetAxisDomainAction = ActionType<
  'SET_AXIS_DOMAIN',
  { nucleiPreferences: NucleiPreferences[] }
>;
type SetXDomainAction = ActionType<
  'SET_X_DOMAIN',
  { xDomain: [number, number] }
>;
type SetYDomainAction = ActionType<
  'SET_Y_DOMAIN',
  { yDomain: [number, number] }
>;

export interface MoveOptions {
  shiftX: number;
  shiftY: number;
}

type MoveAction = ActionType<'MOVE', MoveOptions>;

function extentArray<T extends Numeric>(iterable: Iterable<T>) {
  const [min = 0, max = 0] = extent(iterable);
  return [min, max];
}

function is2DFTSpectrum(
  spectrum: Spectrum,
  nucleus: string,
): spectrum is Spectrum2D & { data: NmrData2DFt } {
  return (
    isFt2DSpectrum(spectrum) && spectrum.info.nucleus?.join(',') === nucleus
  );
}

export type DomainActions =
  | SetXDomainAction
  | SetYDomainAction
  | SetAxisDomainAction
  | MoveAction;

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
      const isFid = isFid1DSpectrum(data[activeSpectrumIndex]);
      data = data.filter((datum) => datum.info.isFid === isFid);
    }
  } else {
    data = data.filter((datum) => isFt1DSpectrum(datum));
  }

  return data as Spectrum1D[];
}

interface GetDomainOptions {
  domainSpectraScope?: 'visible' | 'all';
}

function getDomain(draft: Draft<State>, options: GetDomainOptions = {}) {
  const { domainSpectraScope = 'visible' } = options;
  let xArray: number[] = [];
  let yArray: number[] = [];
  const yDomains: Record<string, number[]> = {};
  const xDomains: Record<string, number[]> = {};

  const data = getActiveData(draft);
  try {
    for (const d of data) {
      const { display, data, id } = d;
      const { y } = get1DDataXY(d);

      const _extent = extentArray(y);
      const domain = [data.x[0], data.x.at(-1) as number];

      yDomains[id] = _extent;
      xDomains[id] = domain;
      if (
        domainSpectraScope === 'all' ||
        (domainSpectraScope === 'visible' && display.isVisible)
      ) {
        xArray = xArray.concat(domain);
        yArray = yArray.concat(_extent);
      }
    }
  } catch (error) {
    // TODO: handle error.
    reportError(error);
  }

  return {
    xDomain: xArray?.length > 0 ? extent(xArray) : [],
    yDomain: yArray?.length > 0 ? extent(yArray) : [],
    yDomains,
    xDomains,
  };
}
function get2DDomain(state: State) {
  let xArray: number[] = [];
  let yArray: number[] = [];
  const yDomains: Record<string, number[]> = {};
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

  if (spectrum && isSpectrum2D(spectrum)) {
    if (isFid2DData(spectrum.data)) {
      const { minX, maxX, minY, maxY } = spectrum.data.re;
      xArray = [minX, maxX];
      yArray = [minY, maxY];
    } else {
      try {
        xArray = data
          .filter((datum) => is2DFTSpectrum(datum, activeTab))
          .flatMap((datum) => {
            const { minX, maxX } = datum.data.rr;
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
  }
  const spectraIDs = new Set();

  for (const n of nucleus) {
    const spectra = activeSpectra[n];
    if (spectra?.length === 1) {
      spectraIDs.add(spectra[0].id);
    }
  }
  const filteredData = data
    .filter((d) => spectraIDs.has(d.id) && d.info.dimension === 1)
    .map((datum) => {
      return datum as Spectrum1D;
    });

  try {
    for (const d of filteredData) {
      const { x, re } = d.data;
      const domain = [x[0], x.at(-1) as number];
      xDomains[d.id] = domain;
      const _extent = extentArray(re);
      yDomains[d.id] = _extent;
    }
  } catch (error) {
    // TODO: handle error.
    reportError(error);
  }

  return {
    xDomain: extentArray(xArray),
    yDomain: extentArray(yArray),
    yDomains,
    xDomains,
  };
}

export interface SetDomainOptions extends GetDomainOptions {
  updateYDomain?: boolean;
  isYDomainShared?: boolean;
  updateXDomain?: boolean;
}

function setDomain(draft: Draft<State>, options?: SetDomainOptions) {
  const {
    updateYDomain = true,
    isYDomainShared = true,
    updateXDomain = true,
    domainSpectraScope,
  } = options || {};
  let domain;

  if (draft.view.spectra.activeTab) {
    if (draft.displayerMode === '1D') {
      domain = getDomain(draft, { domainSpectraScope });
    } else {
      domain = get2DDomain(draft);
    }

    if (updateXDomain) {
      draft.xDomain = domain.xDomain;
      draft.xDomains = domain.xDomains;
    }

    if (updateYDomain) {
      draft.yDomain = domain.yDomain;
      if (draft.displayerMode === '1D') {
        if (isYDomainShared) {
          draft.yDomains = Object.fromEntries(
            Object.keys(domain.yDomains).map((key) => {
              return [key, domain.yDomain];
            }),
          );
        } else {
          draft.yDomains = rescaleToSameTop(domain.yDomains);
        }
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
  const nucleus = view.spectra.activeTab;

  if (displayerMode === '1D') {
    const spectrum = data.find(
      (datum) =>
        xDomains[datum.id] && nucleusToString(datum.info.nucleus) === nucleus,
    );
    draft.mode = spectrum && isFid1DSpectrum(spectrum) ? 'LTR' : 'RTL';
  } else {
    const activeSpectra = getActiveSpectra(draft);
    let hasFt = false;
    if (Array.isArray(activeSpectra) && activeSpectra?.length > 0) {
      hasFt = activeSpectra.some((spectrum) =>
        isFt2DSpectrum(data[spectrum.index]),
      );
    } else {
      hasFt = data.some(
        (spectrum) =>
          isFt2DSpectrum(spectrum) &&
          nucleusToString(spectrum.info.nucleus) === nucleus,
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
//action
function handleSetAxisDomain(draft: Draft<State>, action: SetAxisDomainAction) {
  const { nucleiPreferences } = action.payload;
  const {
    originDomain: { xDomain, yDomain },
    displayerMode,
    view: {
      spectra: { activeTab },
    },
  } = draft;

  const axisDomain: {
    x?: { from?: number; to?: number };
    y?: { from?: number; to?: number };
  } = {};

  const [xNucleus, yNucleus] = activeTab?.split(',') || [];

  for (const nuclei of nucleiPreferences) {
    const { nucleus, axisFrom, axisTo } = nuclei;
    if (nucleus?.toLowerCase() === xNucleus?.toLowerCase()) {
      axisDomain.x = { from: axisFrom, to: axisTo };
    }
    if (nucleus?.toLowerCase() === yNucleus?.toLowerCase()) {
      axisDomain.y = { from: axisFrom, to: axisTo };
    }
  }

  const { x, y } = axisDomain;
  const x1 = x?.from ?? xDomain[0];
  const x2 = x?.to ?? xDomain[1];
  const y1 = y?.from ?? yDomain[0];
  const y2 = y?.to ?? yDomain[1];

  if (displayerMode === '1D') {
    draft.xDomain = [x1, x2];
  } else {
    draft.xDomain = [x1, x2];
    draft.yDomain = [y1, y2];
  }
}

interface Domain {
  xDomain: number[];
  yDomain: number[];
}

function moveOverAxis(
  options: MoveOptions,
  currentDomain: Domain,
  originDomain: Domain,
) {
  const { shiftX, shiftY } = options;
  const [x1, x2] = currentDomain.xDomain;
  const [y1, y2] = currentDomain.yDomain;
  const [x1Origin, x2Origin] = originDomain.xDomain;
  const [y1Origin, y2Origin] = originDomain.yDomain;
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
  return { xDomain: [x1Domain, x2Domain], yDomain: [y1Domain, y2Domain] };
}

function handleMoveOverXAxis(draft: Draft<State>, action: MoveAction) {
  const originXDomain = draft.originDomain.xDomain;
  const originYDomain = draft.originDomain.yDomain;
  const { xDomain, yDomain } = moveOverAxis(
    action.payload,
    { xDomain: draft.xDomain, yDomain: draft.yDomain },
    { xDomain: originXDomain, yDomain: originYDomain },
  );
  draft.xDomain = xDomain;
  draft.yDomain = yDomain;
}

function rescaleToSameTop(yDomains: Record<string, number[]>, scale = 0.8) {
  const newYDomains = {};
  const vScale = 1 / scale;
  for (const spectrumId of Object.keys(yDomains)) {
    const [min, max] = yDomains[spectrumId];

    const pivot = Math.abs(min) > Math.abs(max) ? min : 0;
    const distMin = min - pivot;
    const distMax = max - pivot;
    const newMin = distMin * vScale;
    const newMax = distMax * vScale;

    newYDomains[spectrumId] = [newMin, newMax];
  }
  return newYDomains;
}

export {
  get2DDomain,
  setDomain,
  setMode,
  handleSetXDomain,
  handleSetYDomain,
  handleMoveOverXAxis,
  handleSetAxisDomain,
  moveOverAxis,
};
