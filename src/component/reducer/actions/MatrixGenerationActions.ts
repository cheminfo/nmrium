import { Draft } from 'immer';

import { FilterType } from '../../utility/filterType';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { MatrixGenerationOptions, State } from '../Reducer';
import { ActionType } from '../types/ActionType';

type ToggleMatrixGenerationViewAction = ActionType<
  'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY',
  {
    key: keyof FilterType<MatrixGenerationOptions, boolean>;
  }
>;

export type MatrixGenerationActions = ToggleMatrixGenerationViewAction;

function hideSpectra(draft: Draft<State>) {
  const {
    data: spectra,
    view: {
      spectra: { activeTab },
    },
  } = draft;

  const spectraPerNucleus = getSpectraByNucleus(activeTab, spectra);

  for (const spectrum of spectraPerNucleus) {
    spectrum.display.isVisible = false;
  }
}

function toggleMatrixGenerationViewProperty(
  draft: Draft<State>,
  action: ToggleMatrixGenerationViewAction,
) {
  const { key } = action.payload;
  draft.matrixGenerationOptions[key] = !draft.matrixGenerationOptions[key];

  if (['showStocsy', 'showStocsy'].includes(key)) {
    hideSpectra(draft);
  }
}

export { toggleMatrixGenerationViewProperty };
