import { v4 } from '@lukeed/uuid';
import { Draft } from 'immer';

import * as Filters from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import { Datum1D } from '../../../data/types/data1d/Datum1D';
import { MatrixOptions } from '../../../data/types/view-state/MatrixViewState';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

import { setDomain } from './DomainActions';

function applySignalProcessingFilter(draft: Draft<State>) {
  const { view, data } = draft;
  const nucleus = view.spectra.activeTab;

  const spectra = getSpectraByNucleus(nucleus, data) as Datum1D[];
  for (const spectrum of spectra) {
    FiltersManager.applyFilter(
      spectrum,
      [
        {
          name: Filters.signalProcessing.id,
          options: view.matrixGeneration[nucleus],
        },
      ],
      true,
    );
  }

  setDomain(draft);
}

function handleAddExclusionZone(draft: Draft<State>, action) {
  const { from: startX, to: endX } = action.payload;
  const range = getRange(draft, { startX, endX });
  const { view, xDomain } = draft;
  const nucleus = view.spectra.activeTab;

  const exclusionZone = {
    id: v4(),
    from: range[0],
    to: range[1],
  };

  if (!view.matrixGeneration?.[nucleus]) {
    const options: MatrixOptions = {
      exclusionsZones: [exclusionZone],
      filters: [],
      range: { from: xDomain[0], to: xDomain[1] },
      numberOfPoints: 1024,
    };
    view.matrixGeneration[nucleus] = options;
  } else {
    (view.matrixGeneration[nucleus] as MatrixOptions).exclusionsZones.push(
      exclusionZone,
    );
  }
}

function handleDeleteExclusionZone(draft: Draft<State>, action) {
  const { zone } = action.payload;

  const { view } = draft;
  const nucleus = view.spectra.activeTab;

  if (view.matrixGeneration?.[nucleus]) {
    const options: MatrixOptions = view.matrixGeneration[nucleus];
    options.exclusionsZones = options.exclusionsZones.filter(
      (_zone) => _zone.id !== zone.id,
    );

    applySignalProcessingFilter(draft);
  }
}
function handleSetMatrixGenerationOptions(draft: Draft<State>, action) {
  const { options } = action.payload;
  const { view } = draft;
  const nucleus = view.spectra.activeTab;

  view.matrixGeneration[nucleus] = options;
}

export {
  handleAddExclusionZone,
  handleDeleteExclusionZone,
  handleSetMatrixGenerationOptions,
  applySignalProcessingFilter,
};
