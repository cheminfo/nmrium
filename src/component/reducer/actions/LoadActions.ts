import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';
import lodashMergeWith from 'lodash/mergeWith';
import { buildCorrelationData, CorrelationData } from 'nmr-correlation';
import { Source, Spectrum } from 'nmr-load-save';
import { ParseResult } from 'papaparse';

import { initiateDatum1D } from '../../../data/data1d/Spectrum1D';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D';
import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { linkMetaWithSpectra } from '../../../data/parseMeta/linkMetaWithSpectra';
import { UsedColors } from '../../../types/UsedColors';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants';
import nucleusToString from '../../utility/nucleusToString';
import { OnLoadProcessing } from '../../workspaces/Workspace';
import {
  getDefaultViewState,
  getInitialState,
  State,
  ViewState,
} from '../Reducer';

import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { importSpectraMetaInfo } from './SpectrumsActions';
import { setActiveTab } from './ToolsActions';

function setIsLoading(draft: Draft<State>, isLoading: boolean) {
  draft.isLoading = isLoading;
}

function setColors(draft: Draft<State>, colors: UsedColors) {
  draft.usedColors['1d'] = draft.usedColors['1d'].concat(colors['1d']);
  draft.usedColors['2d'] = draft.usedColors['2d'].concat(colors['2d']);
}

function setCorrelation(draft: Draft<State>, correlations) {
  if (!correlations || Object.keys(correlations).length === 0) {
    draft.correlations = buildCorrelationData([], {
      tolerance: DefaultTolerance,
    });
  } else {
    // in case of older NMRium data are imported, convert hybridization string to number array
    // @TODO remove following command to overwrite correlations at some point in future
    draft.correlations =
      convertHybridizationStringValuesInCorrelations(correlations);

    // draft.correlations = correlations // original command without overwriting
  }
}

function initSpectra(
  inputSpectra: Spectrum[],
  options: { usedColors: UsedColors; onLoadProcessing: OnLoadProcessing },
) {
  const spectra: any = [];
  const { usedColors, onLoadProcessing } = options;
  for (const spectrum of inputSpectra) {
    const { info } = spectrum;
    if (info.dimension === 1) {
      const filters = onLoadProcessing?.[nucleusToString(info.nucleus)] || [];
      spectra.push(initiateDatum1D(spectrum, { usedColors, filters }));
    } else if (info.dimension === 2) {
      spectra.push(initiateDatum2D({ ...spectrum }, { usedColors }));
    }
  }
  return spectra;
}

function setData(
  draft: Draft<State>,
  input: {
    view?: ViewState;
    data?: {
      source?: Source;
      spectra: Spectrum[];
      molecules: StateMoleculeExtended[];
      correlations: CorrelationData;
    };
    usedColors: UsedColors;
    onLoadProcessing?: OnLoadProcessing;
    parseMetaFileResult: ParseResult<any> | null;
  },
  options: {
    autoOnLoadProcessing?: boolean;
  } = {},
) {
  const {
    data,
    usedColors,
    view,
    onLoadProcessing = {},
    parseMetaFileResult = null,
  } = input || {
    data: { spectra: [], molecules: [], correlations: {} },
    multipleAnalysis: {},
  };

  const { autoOnLoadProcessing = true } = options;
  const {
    source,
    spectra = [],
    molecules = [],
    correlations = {},
  } = data || {};

  if (view) {
    const defaultViewState = getDefaultViewState();
    draft.view = lodashMerge(defaultViewState, view);
  }

  setColors(draft, usedColors);

  if (source) {
    draft.source = lodashMergeWith(
      draft.source,
      source,
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      },
    );
  }
  draft.molecules = draft.molecules.concat(
    MoleculeManager.fromJSON(molecules, draft.molecules),
  );
  draft.data = draft.data.concat(
    initSpectra(spectra, {
      usedColors,
      onLoadProcessing: autoOnLoadProcessing ? onLoadProcessing : {},
    }),
  );
  setCorrelation(draft, correlations);

  if (parseMetaFileResult) {
    const { matches } = linkMetaWithSpectra({
      autolink: true,
      spectra: draft.data,
      parseMetaFileResult,
    });
    importSpectraMetaInfo(draft, { payload: { spectraMeta: matches } });
  }
}

function convertHybridizationStringValuesInCorrelations(
  correlations: CorrelationData,
): CorrelationData {
  return {
    ...correlations,
    values: correlations.values.map((correlation) => {
      if (typeof correlation.hybridization === 'string') {
        let values: number[] = [];
        if (correlation.hybridization.length > 0) {
          const hybridizationString: string =
            correlation.hybridization.replaceAll('SP', '');
          const value = Number(hybridizationString);
          values.push(value);
        }
        correlation.hybridization = values;
      }
      return correlation;
    }),
  };
}

function setPreferences(draft: Draft<State>, data) {
  const emptyPreferences = {
    verticalAlign: null,
  };

  const { verticalAlign = null } = data || emptyPreferences;

  if (verticalAlign) {
    changeSpectrumVerticalAlignment(draft, {
      verticalAlign,
    });
  } else {
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });
  }
}

function initData(
  draft: Draft<State>,
  action,
  options: {
    forceInitialize?: boolean;
    autoOnLoadProcessing?: boolean;
  } = {},
) {
  const { forceInitialize = false, autoOnLoadProcessing = true } = options;

  const { data, view } = action.payload;
  if (data?.spectra?.length || forceInitialize) {
    const state = getInitialState();
    setData(state, action.payload, { autoOnLoadProcessing });
    setActiveTab(state, { tab: data?.view?.activeTab || '' });
    state.width = draft.width;
    state.height = draft.height;
    setPreferences(state, data?.view);
    state.isLoading = false;
    state.actionType = action.type;
    return state;
  } else {
    if (view) {
      const defaultViewState = getDefaultViewState();
      draft.view = lodashMerge(defaultViewState, view);
    }
    draft.actionType = action.type;
    draft.isLoading = false;
  }
}

function initiate(draft: Draft<State>, action) {
  return initData(draft, action, {
    forceInitialize: true,
    autoOnLoadProcessing: false,
  });
}

function loadDropFiles(draft: Draft<State>, action) {
  const { payload, type } = action;

  const {
    data: { spectra = [] },
    containsNmrium = false,
    resetSourceObject = true,
  } = payload;

  if (containsNmrium) {
    return initData(draft, action, { autoOnLoadProcessing: false });
  } else {
    setData(draft, payload);
    setActiveTab(draft);
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });

    // set source undefined when dragging and dropping a spectra file to prevent export spectra with the data source.
    if (resetSourceObject && spectra?.length > 0) {
      draft.source = undefined;
    }

    draft.actionType = type;
    draft.isLoading = false;
  }
}

export { setIsLoading, initSpectra, initiate, loadDropFiles };
