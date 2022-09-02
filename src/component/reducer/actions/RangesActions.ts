import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import { xFindClosestIndex } from 'ml-spectra-processing';

import * as Filters from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  addRange,
  changeRangeSignal,
  detectRanges,
  updateRangesRelativeValues,
  changeRange,
  changeRangeRelativeValue,
  updateXShift,
} from '../../../data/data1d/Spectrum1D';
import { setSumOptions } from '../../../data/data1d/Spectrum1D/SumManager';
import { Datum1D } from '../../../data/types/data1d';
import {
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/RangeUtilities';
import { rangeStateInit, State } from '../Reducer';
import getRange from '../helper/getRange';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain, setIntegralsYDomain } from './DomainActions';
import { resetSelectedTool } from './ToolsActions';

function handleAutoRangesDetection(draft: Draft<State>, options) {
  const {
    activeSpectrum,
    data,
    xDomain,
    molecules,
    activeTab: nucleus,
  } = draft;
  if (activeSpectrum?.id) {
    const { index, id } = activeSpectrum;
    const datum = data[index] as Datum1D;

    // add range intial state
    const range = draft.view.ranges.find((r) => r.spectrumID === id);
    if (!range) {
      draft.view.ranges.push({
        spectrumID: id,
        ...rangeStateInit,
      });
    }

    const [from, to] = xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    const detectionOptions = {
      factorStd: 8,
      integrationSum: 100,
      compile: true,
      frequencyCluster: 16,
      clean: true,
      keepPeaks: true,
      ...options, // minMaxRatio default 0.05, lookNegative default false,
    };

    detectRanges(datum, {
      ...detectionOptions,
      windowFromIndex,
      windowToIndex,
      molecules,
      nucleus,
    });
    handleOnChangeRangesData(draft);
    setIntegralsYDomain(draft, datum);
  }
}

function handleAutoSpectraRangesDetection(draft: Draft<State>) {
  const peakPicking = {
    factorStd: 8,
    minMaxRatio: 0.05,
    integrationSum: 100,
    compile: true,
    frequencyCluster: 16,
    clean: true,
    keepPeaks: true,
  };
  const { data, activeTab: nucleus, molecules } = draft;
  for (const datum of data) {
    if (datum.info.dimension === 1) {
      detectRanges(datum as Datum1D, { peakPicking, molecules, nucleus });
      handleOnChangeRangesData(draft);
    }
  }
}

function getRangeIndex(draft: Draft<State>, spectrumIndex, rangeID) {
  return (draft.data[spectrumIndex] as Datum1D).ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
}

function handleDeleteRange(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const { data, resetSelectTool = false } = action.payload;
    const { id = null, assignmentData } = data;
    const datum = draft.data[index] as Datum1D;
    if (id) {
      const rangeIndex = getRangeIndex(draft, index, id);
      unlinkInAssignmentData(assignmentData, [datum.ranges.values[rangeIndex]]);
      datum.ranges.values.splice(rangeIndex, 1);
    } else {
      unlinkInAssignmentData(assignmentData, datum.ranges.values);
      datum.ranges.values = [];
    }
    updateRangesRelativeValues(datum);
    handleOnChangeRangesData(draft);
    if (resetSelectTool) {
      resetSelectedTool(draft);
    }
  }
}

function handleChangeRangeSignalKind(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rowData, value } = action.payload.data;
    const rangeIndex = getRangeIndex(state, index, rowData.id);
    const _range = (draft.data[index] as Datum1D).ranges.values[rangeIndex];
    if (_range?.signals) {
      _range.signals[rowData.tableMetaInfo.signalIndex].kind = value;
      _range.kind = SignalKindsToInclude.includes(value)
        ? DatumKind.signal
        : DatumKind.mixed;
      updateRangesRelativeValues(draft.data[index] as Datum1D);
      handleOnChangeRangesData(draft);
    }
  }
}

function handleSaveEditedRange(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { editedRowData, assignmentData } = action.payload;

    // remove assignments in global state

    const _editedRowData: any = unlink(editedRowData);

    delete _editedRowData.tableMetaInfo;
    delete _editedRowData.rowKey;
    // remove assignments in assignment hook data
    // for now: clear all assignments for this range because signals or levels to store might have changed
    unlinkInAssignmentData(assignmentData, [_editedRowData]);

    const rangeIndex = getRangeIndex(state, index, _editedRowData.id);

    if (_editedRowData.id === 'new') {
      _editedRowData.id = v4();
    }

    (draft.data[index] as Datum1D).ranges.values.splice(
      rangeIndex,
      1,
      _editedRowData,
    );
    updateRangesRelativeValues(draft.data[index] as Datum1D);
    handleOnChangeRangesData(draft);
    resetSelectedTool(draft);
  }
}

function handleDeleteSignal(draft: Draft<State>, action) {
  const {
    spectrum,
    range,
    signal,
    assignmentData,
    unlinkSignalInAssignmentData = true,
  } = action.payload;

  if (spectrum && range) {
    const datum1D = draft.data.find(
      (datum) => datum.id === spectrum.id,
    ) as Datum1D;
    const rangeIndex = datum1D.ranges.values.findIndex(
      (_range) => _range.id === range.id,
    );
    const signalIndex = range.signals.findIndex(
      (_signal) => _signal.id === signal.id,
    );
    // remove assignments for the signal range object in global state
    const _range = unlink(cloneDeep(range), 'signal', { signalIndex });
    if (unlinkSignalInAssignmentData === true) {
      unlinkInAssignmentData(assignmentData, [{ signals: [signal] }]);
    }
    _range.signals.splice(signalIndex, 1);
    datum1D.ranges.values[rangeIndex] = _range;
    // if no signals are existing in a range anymore then delete this range
    if (_range.signals.length === 0) {
      unlinkInAssignmentData(assignmentData, [_range]);
      datum1D.ranges.values.splice(rangeIndex, 1);
    }

    handleOnChangeRangesData(draft);
  }
}

function handleUnlinkRange(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const {
      assignmentData,
      rangeData = null,
      signalIndex = -1,
    } = action.payload;

    // remove assignments in global state
    if (rangeData) {
      const rangeIndex = getRangeIndex(draft, index, rangeData.id);
      const range = cloneDeep(
        (draft.data[index] as Datum1D).ranges.values[rangeIndex],
      );

      let newRange: any = {};
      let id = rangeData.id;
      if (rangeData && signalIndex === -1) {
        newRange = unlink(range, 'range');
      } else {
        newRange = unlink(range, 'signal', { signalIndex });
        id = rangeData.signals[signalIndex].id;
      }
      // remove assignments in assignment hook data
      unlinkInAssignmentData(assignmentData, [
        {
          id,
        },
      ]);
      (draft.data[index] as Datum1D).ranges.values[rangeIndex] = newRange;
    } else {
      const ranges = (draft.data[index] as Datum1D).ranges.values.map(
        (range) => {
          return unlink(range);
        },
      );
      (draft.data[index] as Datum1D).ranges.values = ranges;

      unlinkInAssignmentData(assignmentData, ranges);
    }
  }
}

function handleSetDiaIDRange(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const { rangeData, diaIDs, signalIndex, nbAtoms } = action.payload;
    const getNbAtoms = (input, current = 0) => input + current;
    const rangeIndex = getRangeIndex(draft, index, rangeData.id);
    const _range = (draft.data[index] as Datum1D).ranges.values[rangeIndex];
    if (signalIndex === undefined) {
      _range.diaIDs = diaIDs;
      _range.nbAtoms = getNbAtoms(nbAtoms, _range.nbAtoms);
    } else {
      _range.signals[signalIndex].diaIDs = diaIDs;
      _range.signals[signalIndex].nbAtoms = getNbAtoms(
        nbAtoms,
        _range.signals[signalIndex].nbAtoms,
      );
    }
    // _range.nbAtoms = getNbAtoms(_range);
  }
}

function handleResizeRange(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRange(draft.data[index] as Datum1D, action.data);
  }
}

function handleChangeRangeSum(draft: Draft<State>, options) {
  const { data, activeSpectrum, activeTab: nucleus } = draft;
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = data[index] as Datum1D;
    setSumOptions(datum.ranges, { options, nucleus });
    updateRangesRelativeValues(datum, true);
  }
}

function addNewRange(
  draft: Draft<State>,
  props: { startX: number; endX: number; id?: string },
) {
  const { startX, endX, id } = props;
  const range = getRange(draft, { startX, endX });
  const { activeSpectrum, activeTab: nucleus, molecules } = draft;

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const [from, to] = range;
    // add range intial state
    const rangeState = draft.view.ranges.find(
      (r) => r.spectrumID === activeSpectrum.id,
    );
    if (!rangeState) {
      draft.view.ranges.push({
        spectrumID: activeSpectrum.id,
        ...rangeStateInit,
      });
    }
    addRange(draft.data[index] as Datum1D, {
      from,
      to,
      id,
      nucleus,
      molecules,
    });
    handleOnChangeRangesData(draft);
    setIntegralsYDomain(draft, draft.data[index] as Datum1D);
  }
}

function handleAddRange(draft: Draft<State>, action) {
  const { startX, endX, id } = action.payload;
  if (id === 'new') {
    const { width } = draft;
    const startX = width / 3;
    const endX = startX + 10;
    addNewRange(draft, { startX, endX, id: 'new' });
  } else {
    addNewRange(draft, { startX, endX });
  }
}

function handleChangeRangeRelativeValue(draft, action) {
  const data = action.payload.data;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRangeRelativeValue(draft.data[index], data);
  }
}

function handleChangeRangeSignalValue(draft, action) {
  const { rangeID, signalID, value } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const shift = changeRangeSignal(draft.data[index], {
      rangeID,
      signalID,
      newSignalValue: value,
    });
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, options: shift },
    ]);

    updateXShift(draft.data[index] as Datum1D);

    handleOnChangeRangesData(draft);
    setDomain(draft);
  }
}

function handleOnChangeRangesData(draft) {
  handleUpdateCorrelations(draft);
}

function handleChangeRangesSumFlag(draft, action) {
  const flag = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    draft.data[index].ranges.options.isSumConstant = !flag;
  }
}

function handleUpdateRange(draft: Draft<State>, action) {
  const { range, resetSelectTool = false } = action.payload;
  if (draft.activeSpectrum?.id && range.id) {
    const datum = draft.data[draft.activeSpectrum?.index] as Datum1D;
    const index = datum.ranges.values.findIndex(
      (_range) => _range.id === range.id,
    );
    datum.ranges.values[index] = range;
  }
  if (resetSelectTool) {
    resetSelectedTool(draft);
  }
}

function handleShowMultiplicityTrees(draft: Draft<State>, action) {
  const { id } = action.payload;
  const range = draft.view.ranges.find((r) => r.spectrumID === id);
  if (range) {
    range.showMultiplicityTrees = !range.showMultiplicityTrees;
  } else {
    draft.view.ranges.push({
      spectrumID: id,
      ...rangeStateInit,
      showMultiplicityTrees: !rangeStateInit.showMultiplicityTrees,
    });
  }
}

function handleShowRangesIntegrals(draft: Draft<State>, action) {
  const { id } = action.payload;
  const range = draft.view.ranges.find((r) => r.spectrumID === id);
  if (range) {
    range.showRangesIntegrals = !range.showRangesIntegrals;
  } else {
    draft.view.ranges.push({
      spectrumID: id,
      ...rangeStateInit,
      showRangesIntegrals: !rangeStateInit.showRangesIntegrals,
    });
  }
}

function handleShowJGraph(draft: Draft<State>, action) {
  const { id } = action.payload;
  const range = draft.view.ranges.find((r) => r.spectrumID === id);
  if (range) {
    range.showJGraph = !range.showJGraph;
  } else {
    draft.view.ranges.push({
      spectrumID: id,
      ...rangeStateInit,
      showJGraph: !rangeStateInit.showJGraph,
    });
  }
}

export {
  handleAutoRangesDetection,
  handleDeleteRange,
  handleDeleteSignal,
  handleChangeRangeSum,
  handleAddRange,
  handleResizeRange,
  handleChangeRangeRelativeValue,
  handleChangeRangeSignalValue,
  handleChangeRangeSignalKind,
  handleSaveEditedRange,
  handleUnlinkRange,
  handleSetDiaIDRange,
  handleChangeRangesSumFlag,
  handleUpdateRange,
  handleShowMultiplicityTrees,
  handleShowRangesIntegrals,
  handleAutoSpectraRangesDetection,
  handleShowJGraph,
};
