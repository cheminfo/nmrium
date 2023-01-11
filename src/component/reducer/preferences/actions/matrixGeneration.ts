import { v4 } from '@lukeed/uuid';
import { Draft } from 'immer';

import { MatrixOptions } from '../../../../data/types/data1d/MatrixOptions';
import {
  addMatrixGenerationExclusionZoneAction,
  PreferencesState,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

function addExclusionZone(
  draft: Draft<PreferencesState>,
  action: addMatrixGenerationExclusionZoneAction,
) {
  const { zone, range, nucleus } = action.payload;
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.formatting.panels;

  const exclusionZone = {
    id: v4(),
    ...zone,
  };

  if (!panels.matrixGeneration?.[nucleus]) {
    const options: MatrixOptions = {
      exclusionsZones: [exclusionZone],
      filters: [],
      range,
      numberOfPoints: 1024,
    };
    panels.matrixGeneration = {
      ...panels.matrixGeneration,
      [nucleus]: options,
    };
  } else {
    (panels.matrixGeneration[nucleus] as MatrixOptions).exclusionsZones.push(
      exclusionZone,
    );
  }
}

function deleteExclusionZone(draft: Draft<PreferencesState>, action) {
  const { zone, nucleus } = action.payload;
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.formatting.panels;

  if (panels.matrixGeneration?.[nucleus]) {
    const options: MatrixOptions = panels.matrixGeneration[nucleus];
    options.exclusionsZones = options.exclusionsZones.filter(
      (_zone) => _zone.id !== zone.id,
    );
  }
}

function setMatrixGenerationOptions(draft: Draft<PreferencesState>, action) {
  const { options, nucleus } = action.payload;
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.formatting.panels;

  panels.matrixGeneration = { ...panels.matrixGeneration, [nucleus]: options };
}

export { addExclusionZone, deleteExclusionZone, setMatrixGenerationOptions };
