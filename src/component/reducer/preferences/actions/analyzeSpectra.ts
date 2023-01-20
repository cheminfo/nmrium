import { Draft } from 'immer';

import * as MultipleAnalysis from '../../../../data/data1d/multipleSpectraAnalysis';
import { orderRange } from '../../helper/getRange';
import { getMultipleSpectraAnalysisDefaultValues } from '../panelsPreferencesDefaultValues';
import {
  AnalyzeSpectraAction,
  ChangeAnalysisColumnValueKeyAction,
  DeleteAnalysisColumn,
  PreferencesState,
  SetSpectraAnalysisPanelPreferencesAction,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function analyzeSpectra(
  draft: Draft<PreferencesState>,
  action: AnalyzeSpectraAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.formatting.panels;
  const { start, end, nucleus, columnKey } = action.payload;

  if (!panels.multipleSpectraAnalysis) {
    panels.multipleSpectraAnalysis =
      getMultipleSpectraAnalysisDefaultValues(nucleus);
  }

  const [from, to] = orderRange(start, end);

  MultipleAnalysis.analyzeSpectra(panels.multipleSpectraAnalysis, {
    from,
    to,
    nucleus,
    columnKey,
  });
}

export function changeAnalysisColumnValueKey(
  draft: Draft<PreferencesState>,
  action: ChangeAnalysisColumnValueKeyAction,
) {
  const { columnKey, valueKey, nucleus } = action.payload;
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.formatting.panels;

  MultipleAnalysis.changeColumnValueKey(
    panels.multipleSpectraAnalysis as any,
    nucleus,
    columnKey,
    valueKey as any,
  );
}
export function deleteAnalysisColumn(
  draft: Draft<PreferencesState>,
  action: DeleteAnalysisColumn,
) {
  const { columnKey, nucleus } = action.payload;
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.formatting.panels;
  MultipleAnalysis.deleteSpectraAnalysis(
    panels.multipleSpectraAnalysis as any,
    columnKey,
    nucleus,
  );
}

export function setSpectraAnalysisPanelsPreferences(
  draft: Draft<PreferencesState>,
  action: SetSpectraAnalysisPanelPreferencesAction,
) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { nucleus, data } = action.payload;
    const panels = currentWorkspacePreferences.formatting.panels;

    if (!panels?.multipleSpectraAnalysis) {
      panels.multipleSpectraAnalysis =
        getMultipleSpectraAnalysisDefaultValues(nucleus);
    }

    const { analysisOptions, legendsFields } = data;
    panels.multipleSpectraAnalysis[nucleus] = {
      legendsFields,
      analysisOptions: MultipleAnalysis.mapColumns(analysisOptions),
    };
  }
}
