import type { Spectrum1D, Spectrum2D, Spectrum } from '@zakodium/nmrium-core';
import { assertDefinedNotNull } from '@zakodium/utils';
import type { NmrData2DFt } from 'cheminfo-types';
import { extent } from 'd3-array';
import type { Draft } from 'immer';

import {
  get1DDataXY,
  isSpectrum1D,
} from '../../../data/data1d/Spectrum1D/index.ts';
import {
  isFid1DSpectrum,
  isFt1DSpectrum,
} from '../../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/index.ts';
import {
  isFid2DData,
  isFt2DSpectrum,
} from '../../../data/data2d/Spectrum2D/isSpectrum2D.ts';
import nucleusToString from '../../utility/nucleusToString.ts';
import type { State, VerticalAlignment } from '../Reducer.ts';
import { rescaleToSameTop } from '../helper/Zoom1DManager.ts';
import { getActiveSpectra } from '../helper/getActiveSpectra.ts';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.ts';
import { getLiveProcessingsSpectrum } from '../helper/getSpectrum.ts';
import type { ActionType } from '../types/ActionType.ts';

import type { SetDomainOptions } from './DomainActions.ts';
import { is2DFTSpectrum, setMode } from './DomainActions.ts';
import { changeSpectrumVerticalAlignment } from './PreferencesActions.ts';

type SetSpectrumAction = ActionType<
  'SET_SPECTRUM',
  {
    index: number;
    spectrum: Spectrum;
    onProduce: (draft: Draft<State>, processedSpectrum: Spectrum) => void;
  }
>;

type SetTempSpectra = ActionType<
  'SET_TEMP_SPECTRA',
  {
    spectra: Spectrum[] | undefined;
    onProduce?: (draft: Draft<State>, processedSpectrum: Spectrum) => void;
  }
>;

export type ProcessingsActions = SetSpectrumAction | SetTempSpectra;

export function setSpectrum(draft: Draft<State>, action: SetSpectrumAction) {
  const { index, spectrum, onProduce } = action.payload;

  draft.data[index] = spectrum;

  onProduce(draft, spectrum);
}

export function setTempSpectra(draft: Draft<State>, action: SetTempSpectra) {
  const { spectra, onProduce } = action.payload;

  const active = getActiveSpectrum(draft);
  assertDefinedNotNull(active);

  draft.tempData = spectra;
  onProduce?.(
    draft,
    draft.tempData.find((s: Spectrum) => s.id === active.id),
  );
}

export function updateLiveProcessingsView(draft: Draft<State>) {
  setLiveProcessingsDomain(draft);
  setLiveProcessingsMode(draft);
  changeLiveProcessingsSpectrumVerticalAlignment(draft, {
    verticalAlign: 'auto-check',
  });
}

function setLiveProcessingsDomain(
  draft: Draft<State>,
  options?: SetDomainOptions,
) {
  const {
    updateYDomain = true,
    isYDomainShared = true,
    updateXDomain = true,
    domainSpectraScope,
  } = options || {};

  if (draft.view.spectra.activeTab) {
    const domain =
      draft.displayerMode === '1D'
        ? getLiveProcessingsDomain(draft, { domainSpectraScope })
        : getLiveProcessings2DDomain(draft);

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

interface GetDomainOptions {
  domainSpectraScope?: 'visible' | 'all';
}
type NumberExtent = [number, number];
interface GetDomainReturn {
  xDomain: NumberExtent;
  yDomain: NumberExtent;
  xDomains: Record<string, NumberExtent>;
  yDomains: Record<string, NumberExtent>;
}
function extentArray(iterable: Iterable<number>): NumberExtent {
  const [min = 0, max = 0] = extent(iterable);
  return [min, max];
}
function getLiveProcessingsDomain(
  draft: Draft<State>,
  options: GetDomainOptions = {},
): GetDomainReturn {
  const { domainSpectraScope = 'visible' } = options;
  let xArray: number[] = [];
  let yArray: number[] = [];
  const yDomains: Record<string, NumberExtent> = {};
  const xDomains: Record<string, NumberExtent> = {};

  const data = getLiveProcessingsActiveData(draft);
  try {
    for (const d of data) {
      const { display, data, id } = d;
      const { y } = get1DDataXY(d);

      const _extent = extentArray(y);
      const domain: NumberExtent = [data.x[0], data.x.at(-1) as number];

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
    xDomain: xArray?.length > 0 ? extentArray(xArray) : [0, 0],
    yDomain: yArray?.length > 0 ? extentArray(yArray) : [0, 0],
    yDomains,
    xDomains,
  };
}

function getLiveProcessings2DDomain(state: State) {
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
  const spectrum = getLiveProcessingsSpectrum(state);

  if (isSpectrum2D(spectrum)) {
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
  const filteredData = data.filter(
    (d) => spectraIDs.has(d.id) && isSpectrum1D(d),
  ) as Spectrum1D[];

  try {
    for (const d of filteredData) {
      const { x, re } = d.data;
      xDomains[d.id] = [x[0], x.at(-1) as number];
      yDomains[d.id] = extentArray(re);
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

function getLiveProcessingsActiveData(draft: Draft<State>): Spectrum1D[] {
  let data = draft.tempData.filter(
    (datum: Spectrum) =>
      nucleusToString(datum.info.nucleus) === draft.view.spectra.activeTab &&
      isSpectrum1D(datum),
  );

  const spectrum = getLiveProcessingsSpectrum(draft);
  if (spectrum) {
    const isFid = isFid1DSpectrum(spectrum);
    data = data.filter((datum: Spectrum) => datum.info.isFid === isFid);
  } else {
    data = data.filter((datum: Spectrum) => isFt1DSpectrum(datum));
  }

  return data as Spectrum1D[];
}

function setLiveProcessingsMode(draft: Draft<State>) {
  const {
    xDomains,
    view: { spectra },
    tempData,
    displayerMode,
  } = draft;
  const { activeTab: nucleus } = spectra;

  if (displayerMode === '1D') {
    const spectrum = tempData.find(
      (datum: Spectrum) =>
        xDomains[datum.id] && nucleusToString(datum.info.nucleus) === nucleus,
    );
    draft.mode = spectrum && isFid1DSpectrum(spectrum) ? 'LTR' : 'RTL';
  } else {
    const activeSpectra = getActiveSpectra(spectra);
    let hasFt: boolean;
    if (Array.isArray(activeSpectra) && activeSpectra?.length > 0) {
      hasFt = activeSpectra.some((spectrum) =>
        isFt2DSpectrum(tempData[spectrum.index]),
      );
    } else {
      hasFt = tempData.some(
        (spectrum: Spectrum) =>
          isFt2DSpectrum(spectrum) &&
          nucleusToString(spectrum.info.nucleus) === nucleus,
      );
    }

    draft.mode = hasFt ? 'RTL' : 'LTR';
  }
}

interface AlignmentOptions {
  verticalAlign?: VerticalAlignment | 'auto-check';
  activeTab?: string;
}
function changeLiveProcessingsSpectrumVerticalAlignment(
  draft: Draft<State>,
  options: AlignmentOptions,
) {
  const { verticalAlign = 'bottom', activeTab } = options;
  const nucleus = activeTab || draft.view.spectra.activeTab;

  const data = draft.tempData;

  if (!data || data.length === 0) return;

  let dataPerNucleus: Spectrum1D[] = [];
  if (['auto-check', 'stack'].includes(options.verticalAlign || '')) {
    dataPerNucleus = data.filter(
      (datum: Spectrum) =>
        datum.info.nucleus === nucleus && isSpectrum1D(datum),
    ) as Spectrum1D[];
  }

  if (!nucleus) return;

  if (verticalAlign === 'auto-check') {
    const isFid =
      dataPerNucleus[0]?.info.isFid &&
      !dataPerNucleus.some((d) => !d.info.isFid);

    if (isFid) {
      draft.view.verticalAlign[nucleus] = 'center';
    } else {
      let hasMoreThanOnFt = false;
      let count = 1;
      for (const spectrum of dataPerNucleus) {
        if (count > 1) {
          hasMoreThanOnFt = true;
          break;
        }
        if (spectrum.info.isFt) {
          count++;
        }
      }
      if (hasMoreThanOnFt) {
        draft.view.verticalAlign[nucleus] = 'stack';
      } else {
        draft.view.verticalAlign[nucleus] = 'bottom';
      }
    }
  } else {
    draft.view.verticalAlign[nucleus] = verticalAlign;
  }
}
