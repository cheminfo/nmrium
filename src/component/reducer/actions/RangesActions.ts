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
  updateIntegralRanges,
  changeRange,
  changeRangesRelative,
  Datum1D,
  updateXShift,
} from '../../../data/data1d/Spectrum1D';
import {
  getPubIntegral,
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/RangeUtilities';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain } from './DomainActions';

function handleAutoRangesDetection(draft: Draft<State>, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const [from, to] = draft.xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    detectRanges(datum, {
      ...detectionOptions,
      windowFromIndex,
      windowToIndex,
    });
    handleOnChangeRangesData(draft);
  }
}

function handleAutoSpectraRangesDetection(draft: Draft<State>) {
  const peakPicking = {
    factorStd: 8,
    minMaxRatio: 0.1,
    nH: 100,
    compile: true,
    frequencyCluster: 16,
    clean: true,
    keepPeaks: true,
  };
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let index = 0; index < draft.data.length; index++) {
    if (draft.data[index].info.dimension === 1) {
      detectRanges(draft.data[index] as Datum1D, { peakPicking });
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
    const { id = null, assignmentData } = action.payload.data;
    const datum = draft.data[index] as Datum1D;
    if (id) {
      const rangeIndex = getRangeIndex(draft, index, id);
      unlinkInAssignmentData(assignmentData, [datum.ranges.values[rangeIndex]]);
      datum.ranges.values.splice(rangeIndex, 1);
    } else {
      unlinkInAssignmentData(assignmentData, datum.ranges.values);
      datum.ranges.values = [];
    }
    updateIntegralRanges(datum);
    handleOnChangeRangesData(draft);
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
      updateIntegralRanges(draft.data[index]);
      handleOnChangeRangesData(draft);
    }
  }
}

function handleSaveEditedRange(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { editedRowData, assignmentData } = action.payload;

    // reset temp range
    draft.toolOptions.data.tempRange = null;

    // remove assignments in global state

    const _editedRowData = unlink(editedRowData);

    delete _editedRowData.tableMetaInfo;
    delete _editedRowData.rowKey;
    // remove assignments in assignment hook data
    // for now: clear all assignments for this range because signals or levels to store might have changed
    unlinkInAssignmentData(assignmentData, [_editedRowData]);
    const rangeIndex = getRangeIndex(state, index, _editedRowData.id);
    (draft.data[index] as Datum1D).ranges.values[rangeIndex] = _editedRowData;
    updateIntegralRanges(draft.data[index]);
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

function handleSetDiaIDRange(draft, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const { rangeData, diaIDs, signalIndex, nbAtoms } = action.payload;
    const getNbAtoms = (input, current = 0) => input + current;
    const rangeIndex = getRangeIndex(draft, index, rangeData.id);
    const _range = draft.data[index].ranges.values[rangeIndex];
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
    _range.pubIntegral = getPubIntegral(_range);
  }
}

function handleResizeRange(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRange(draft.data[index], action.data);
  }
}

function handleChangeRangeSum(draft: Draft<State>, value) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    (draft.data[index] as Datum1D).ranges.options.sum = value;
    updateIntegralRanges(draft.data[index], true);
  }
}
function handleAddRange(draft: Draft<State>, action) {
  const { startX, endX } = action;
  const range = getRange(draft, { startX, endX });

  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const [from, to] = range;
    addRange(draft.data[index], { from, to });
    handleOnChangeRangesData(draft);
  }
}

function handleChangeRangeRelativeValue(draft, action) {
  const data = action.payload.data;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRangesRelative(draft.data[index], data);
  }
}

function handleChangeRangeSignalValue(draft, action) {
  const { rangeID, signalID, value } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const shift = changeRangeSignal(
      draft.data[index],
      rangeID,
      signalID,
      value,
    );
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

function handleChangeTempRange(draft: Draft<State>, action) {
  draft.toolOptions.data.tempRange = action.payload.tempRange;
}

function handleShowMultiplicityTrees(draft: Draft<State>) {
  draft.toolOptions.data.showMultiplicityTrees =
    !draft.toolOptions.data.showMultiplicityTrees;
}

function handleShowRangesIntegrals(draft: Draft<State>) {
  draft.toolOptions.data.showRangesIntegrals =
    !draft.toolOptions.data.showRangesIntegrals;
}

export {
  handleAutoRangesDetection,
  handleDeleteRange,
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
  handleChangeTempRange,
  handleShowMultiplicityTrees,
  handleShowRangesIntegrals,
  handleAutoSpectraRangesDetection,
};
