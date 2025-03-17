import type { Draft } from 'immer';
import { produce } from 'immer';
import lodashMerge from 'lodash/merge.js';
import lodashMergeWith from 'lodash/mergeWith.js';
import type { CorrelationData } from 'nmr-correlation';
import { buildCorrelationData } from 'nmr-correlation';
import type {
  NmriumState,
  SpectraColors,
  Spectrum,
  ViewState,
} from 'nmr-load-save';
import type { ParseResult } from 'papaparse';

import { initiateDatum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D/index.js';
import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager.js';
import { linkMetaWithSpectra } from '../../../data/parseMeta/linkMetaWithSpectra.js';
import type { UsedColors } from '../../../types/UsedColors.js';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants.js';
import type { State } from '../Reducer.js';
import { getDefaultViewState, getInitialState } from '../Reducer.js';
import type { ActionType } from '../types/ActionType.js';

import { changeSpectrumVerticalAlignment } from './PreferencesActions.js';
import { setSpectraMetaInfo } from './SpectraActions.js';
import { setActiveTab } from './ToolsActions.js';

//TODO use viewState type instead of any { view?: ViewState }
interface InitiateProps {
  nmriumState: Partial<NmriumState>;
}
interface InputProps extends InitiateProps {
  containsNmrium?: boolean;
  usedColors?: UsedColors;
  parseMetaFileResult?: ParseResult<any> | null;
  resetSourceObject?: boolean;
  spectraColors?: SpectraColors;
}

type SetIsLoadingAction = ActionType<
  'SET_LOADING_FLAG',
  {
    isLoading: boolean;
  }
>;
type LoadDropFilesAction = ActionType<'LOAD_DROP_FILES', InputProps>;
type InitiateAction = ActionType<'INITIATE', InitiateProps>;

export type LoadActions =
  | SetIsLoadingAction
  | LoadDropFilesAction
  | InitiateAction;

function convertHybridizationStringValuesInCorrelations(
  correlations: CorrelationData,
): CorrelationData {
  return {
    ...correlations,
    values: correlations.values.map((correlation) => {
      if (typeof correlation.hybridization === 'string') {
        const values: number[] = [];
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

function setCorrelation(draft: Draft<State>, correlations: CorrelationData) {
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

function setData(draft: Draft<State>, input: InputProps) {
  const {
    nmriumState: { data, view },
    parseMetaFileResult = null,
    spectraColors = {
      oneDimension: [],
      twoDimensions: [],
      highlightColor: '#ffd70080',
      indicatorLineColor: '#2FFF0085',
    },
  } = input || {
    nmriumState: { data: { spectra: [], molecules: [], correlations: {} } },
    multipleAnalysis: {},
  };

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
      usedColors: draft.usedColors,
      molecules: draft.molecules,
      spectraColors,
    }),
  );
  setCorrelation(draft, correlations);

  if (parseMetaFileResult) {
    const { matches } = linkMetaWithSpectra({
      autolink: true,
      spectra: draft.data,
      parseMetaFileResult,
    });
    setSpectraMetaInfo(draft, matches);
  }
}

function initSpectra(
  inputSpectra: Spectrum[],
  options: {
    usedColors: UsedColors;
    molecules: StateMoleculeExtended[];
    spectraColors: SpectraColors;
  },
) {
  const spectra: any = [];
  const { usedColors, molecules, spectraColors } = options;
  for (const spectrum of inputSpectra) {
    const { info } = spectrum;
    if (info.dimension === 1) {
      spectra.push(
        initiateDatum1D(spectrum, {
          usedColors,
          molecules,
          colors: spectraColors.oneDimension,
        }),
      );
    } else if (info.dimension === 2) {
      spectra.push(
        initiateDatum2D(
          { ...spectrum },
          { usedColors, colors: spectraColors.twoDimensions },
        ),
      );
    }
  }
  return spectra;
}

function setPreferences(draft: Draft<State>, data: ViewState) {
  const emptyPreferences = {
    verticalAlign: null,
  };

  const { verticalAlign = null } = data || emptyPreferences;

  const vAlign = verticalAlign?.[draft.view.spectra.activeTab];
  if (vAlign) {
    changeSpectrumVerticalAlignment(draft, {
      verticalAlign: vAlign,
    });
  } else {
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });
  }
}

function initData(
  draft: Draft<State>,
  action: LoadDropFilesAction | InitiateAction,
  options: {
    forceInitialize?: boolean;
  } = {},
) {
  const { forceInitialize = false } = options;

  const {
    nmriumState: { data, view },
  } = action.payload;

  const viewState = view as ViewState;
  if (data?.spectra?.length || forceInitialize) {
    const state = getInitialState();
    return produce(state, (initialDraft) => {
      setData(initialDraft, action.payload);
      setActiveTab(initialDraft, {
        tab: viewState?.spectra?.activeTab || '',
        domainOptions: { domainSpectraScope: 'all' },
      });
      initialDraft.width = draft.width;
      initialDraft.height = draft.height;
      setPreferences(initialDraft, viewState);
      initialDraft.isLoading = false;
      initialDraft.actionType = action.type;
    });
  } else {
    if (view) {
      const defaultViewState = getDefaultViewState();
      draft.view = lodashMerge(defaultViewState, view);
    }
    draft.actionType = action.type;
    draft.isLoading = false;
  }
}

//action
function handleSetIsLoading(draft: Draft<State>, action: SetIsLoadingAction) {
  draft.isLoading = action.payload.isLoading;
}

//action
function handleInitiate(draft: Draft<State>, action: InitiateAction) {
  return initData(draft, action, {
    forceInitialize: true,
  });
}

//action
function handleLoadDropFiles(draft: Draft<State>, action: LoadDropFilesAction) {
  const { payload, type } = action;

  const {
    nmriumState: { data: { spectra = [] } = {} },
    containsNmrium = false,
    resetSourceObject = true,
  } = payload;

  if (containsNmrium) {
    return initData(draft, action);
  } else {
    setData(draft, payload);
    setActiveTab(draft, { domainOptions: { domainSpectraScope: 'all' } });
    changeSpectrumVerticalAlignment(draft, { verticalAlign: 'auto-check' });

    // set source undefined when dragging and dropping a spectra file to prevent export spectra with the data source.
    if (resetSourceObject && spectra?.length > 0) {
      draft.source = undefined;
    }

    draft.actionType = type;
    draft.isLoading = false;
  }
}

export { handleSetIsLoading, initSpectra, handleInitiate, handleLoadDropFiles };
