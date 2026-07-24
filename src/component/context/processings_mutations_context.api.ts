import type {
  Spectrum,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';
import {
  isSpectrum1D,
  isSpectrum2D,
  sliceData1D,
  sliceData2D,
  sliceSpectrum,
} from '@zakodium/nmrium-core';
import {
  assertDefined,
  assertNotNullish,
  assertUnreachable,
  noop,
} from '@zakodium/utils';
import type { Draft } from 'immer';
import { useMemo } from 'react';
import { useAccordionControls } from 'react-science/ui';
import { useEventCallback } from 'usehooks-ts';

import { initializeContoursLevels } from '../../data/data2d/Spectrum2D/contours.ts';
import type { State } from '../reducer/Reducer.ts';
import { setDomain, setMode } from '../reducer/actions/DomainActions.ts';
import { updateView } from '../reducer/actions/FiltersActions.ts';
import zoomHistoryManager from '../reducer/helper/ZoomHistoryManager.ts';
import { getActiveSpectrum } from '../reducer/helper/getActiveSpectrum.ts';

import { useChartData } from './ChartContext.tsx';
import { useCore } from './CoreContext.tsx';
import { useDispatch } from './DispatchContext.tsx';

export type ProcessingsMutations = ReturnType<
  typeof useProcessingsMutationsAPI
>;

export function useProcessingsMutationsAPI() {
  const core = useCore();
  const state = useChartData();
  const dispatch = useDispatch();
  const { open: openPanel } = useAccordionControls();

  function setIsLoading(isLoading: boolean) {
    dispatch({
      type: 'SET_LOADING_FLAG',
      payload: { isLoading },
    });
  }

  /**
   * Return sliced spectrum allowing free mutations
   */
  function getSpectrum() {
    const activeSpectrum = getActiveSpectrum(state);
    if (!activeSpectrum) return {};

    const id = activeSpectrum.id;
    const indexSpectrum = state.data.findIndex((s) => s.id === id);
    if (indexSpectrum === -1) return {};

    const spectrum = sliceSpectrum(state.data[indexSpectrum]);

    return { spectrum, indexSpectrum };
  }

  /**
   * Return sliced spectrum live processed allowing free mutations
   */
  function getSpectrumLiveProcessed() {
    const spectrum = state.spectrumLiveProcessed;
    if (!spectrum) return;

    return sliceSpectrum(spectrum);
  }

  async function submit(
    spectrum: Spectrum,
    index: number,
    onProduce: (draft: Draft<State>, processedSpectrum: Spectrum) => void,
  ) {
    setIsLoading(true);
    const processedSpectrum = await core
      .processSpectrum(spectrum)
      .finally(() => setIsLoading(false));

    dispatch({
      type: 'SET_SPECTRUM',
      payload: {
        index,
        spectrum: processedSpectrum,
        onProduce: (draft) => onProduce(draft, processedSpectrum),
      },
    });
  }

  function resetSelectedTool() {
    dispatch({
      type: 'SELECT_PROCESSING_OPERATOR',
      payload: { operatorId: undefined },
    });
  }

  // --- API --- //

  const resetLiveChange = useEventCallback(function resetLiveChange() {
    dispatch({
      type: 'SET_SPECTRUM_LIVE_PROCESSED',
      payload: {
        spectrumLiveProcessed: undefined,
      },
    });
  });

  const apply = useEventCallback(async function apply(
    operation: SpectrumProcessingOperation<any, any>,
    indexOperation: number,
  ) {
    const { spectrum, indexSpectrum } = getSpectrum();

    if (!spectrum?.processings) return;
    if (indexOperation > spectrum.processings.length) return;

    spectrum.processings[indexOperation] = operation;

    resetSelectedTool();
    resetLiveChange();
    await submit(spectrum, indexSpectrum, (draft) => {
      const {
        domainUpdateRules = {
          updateXDomain: false,
          updateYDomain: false,
        },
      } = core.getOperator(operation.operatorId) ?? {};
      updateView(draft, domainUpdateRules);
    });
  });

  const reorder = useEventCallback(async function reorder(
    sourceIndex: number,
    targetIndex: number,
  ) {
    const { spectrum, indexSpectrum } = getSpectrum();
    if (!spectrum?.processings) return;

    [spectrum.processings[sourceIndex], spectrum.processings[targetIndex]] = [
      spectrum.processings[targetIndex],
      spectrum.processings[sourceIndex],
    ];

    await submit(spectrum, indexSpectrum, noop);
  });

  const remove = useEventCallback(async function remove(uid: string) {
    const { spectrum, indexSpectrum } = getSpectrum();
    if (!spectrum?.processings) return;

    spectrum.processings = spectrum.processings.filter((p) => p.uid !== uid);

    await submit(spectrum, indexSpectrum, (draft) => {
      draft.toolOptions.data.activeFilterID = null;
      resetSelectedTool();
      setDomain(draft);
      setMode(draft);
    });
  });

  const removeAll = useEventCallback(async function removeAll() {
    const { spectrum, indexSpectrum } = getSpectrum();

    if (!spectrum?.processings) return;
    if (spectrum.processings.length === 0) return;

    spectrum.processings = [];

    await submit(spectrum, indexSpectrum, (draft) => {
      draft.toolOptions.data.activeFilterID = null;
      resetSelectedTool();
      setDomain(draft);
      setMode(draft);
    });
  });

  const switchEnabled = useEventCallback(async function switchEnabled(
    uid: string,
  ) {
    const { spectrum, indexSpectrum } = getSpectrum();
    if (!spectrum?.processings) return;

    const operationIndex = spectrum.processings.findIndex((p) => p.uid === uid);
    if (operationIndex === -1) return;

    const operation = spectrum.processings[operationIndex];
    operation.enabled = !operation.enabled;

    await submit(spectrum, indexSpectrum, (draft, processedSpectrum) => {
      if (isSpectrum2D(processedSpectrum) && processedSpectrum.info.isFt) {
        draft.view.spectraContourLevels[processedSpectrum.id] =
          initializeContoursLevels(processedSpectrum);
      }

      resetSelectedTool();
      setDomain(draft);
      setMode(draft);

      const zoomHistory = zoomHistoryManager(
        draft.zoom.history,
        draft.view.spectra.activeTab,
      );
      const zoomValue = zoomHistory.getLast();

      if (zoomValue) {
        draft.xDomain = zoomValue.xDomain;
        draft.yDomain = zoomValue.yDomain;
      }
    });
  });

  // Related to live update
  const prepareLiveChange = useEventCallback(async function prepareLiveChange(
    uid: string,
    shouldProcessAll: boolean,
  ) {
    const { spectrum } = getSpectrum();
    if (!spectrum?.processings) return;

    const preProcessings: typeof spectrum.processings = [];
    const processings: typeof spectrum.processings = [];

    let didFindUid = false;
    for (const operation of spectrum.processings) {
      if (uid === operation.uid) didFindUid = true;
      if (didFindUid) processings.push(structuredClone(operation));
      else preProcessings.push(structuredClone(operation));
    }

    // apply preProcessings
    spectrum.processings = preProcessings;
    const preProcessedSpectrum = await core.processSpectrum(spectrum);

    // prepare processings for live-update
    preProcessedSpectrum.processings = processings;
    preProcessedSpectrum.originalInfo = structuredClone(
      preProcessedSpectrum.info,
    );
    if (isSpectrum1D(preProcessedSpectrum)) {
      preProcessedSpectrum.originalData = sliceData1D(
        preProcessedSpectrum.data,
      );
    } else if (isSpectrum2D(preProcessedSpectrum)) {
      preProcessedSpectrum.originalData = sliceData2D(
        preProcessedSpectrum.data,
      );
    } else {
      assertUnreachable(preProcessedSpectrum);
    }

    // apply the rest of processings
    const savedProcessings = structuredClone(preProcessedSpectrum.processings);

    if (!shouldProcessAll) {
      preProcessedSpectrum.processings.splice(1);
    }
    const processedSpectrum = await core.processSpectrum(preProcessedSpectrum);
    assertDefined(processedSpectrum.processings);
    const processedOperation = processedSpectrum.processings[0];
    processedSpectrum.processings = savedProcessings;
    spectrum.processings[0] = processedOperation;

    dispatch({
      type: 'SET_SPECTRUM_LIVE_PROCESSED',
      payload: {
        spectrumLiveProcessed: processedSpectrum,
      },
    });
  });

  const applyLiveChange = useEventCallback(async function applyLiveChange(
    operation: SpectrumProcessingOperation<any, any>,
    shouldProcessAll: boolean,
  ) {
    const spectrum = getSpectrumLiveProcessed();
    if (!spectrum?.processings) return;

    const indexOperation = spectrum.processings.findIndex(
      (p) => p.uid === operation.uid,
    );
    if (indexOperation === -1) return;

    const savedProcessings = structuredClone(spectrum.processings);

    spectrum.processings[indexOperation] = operation;
    if (!shouldProcessAll) {
      spectrum.processings.splice(indexOperation + 1);
    }
    const processedSpectrum = await core.processSpectrum(spectrum);
    assertDefined(processedSpectrum.processings);
    const processedOperation = processedSpectrum.processings[indexOperation];
    processedSpectrum.processings = savedProcessings;
    spectrum.processings[indexOperation] = processedOperation;

    dispatch({
      type: 'SET_SPECTRUM_LIVE_PROCESSED',
      payload: {
        spectrumLiveProcessed: processedSpectrum,
      },
    });
  });

  const triggerOperation = useEventCallback(async function triggerOperation(
    operation: SpectrumProcessingOperation<any, any>,
  ) {
    const { spectrum, indexSpectrum } = getSpectrum();
    if (!spectrum) return;

    spectrum.processings ??= [];
    let operationIndex = spectrum.processings.findIndex(
      (processing) =>
        processing.uid === operation.uid ||
        processing.operatorId === operation.operatorId,
    );

    if (operationIndex === -1) {
      spectrum.processings.push(operation);
      operationIndex = spectrum.processings.length - 1;
    }

    operation = spectrum.processings[operationIndex];

    const operatorUI = core.slotOperator(operation.operatorId);
    const operator = core.getOperator(operation.operatorId);
    assertNotNullish(operatorUI);
    assertNotNullish(operator);

    openPanel('processingsPanel');
    resetLiveChange();
    await submit(spectrum, indexSpectrum, (draft) =>
      updateView(draft, operator.domainUpdateRules),
    );

    if (operatorUI.isEditable) {
      dispatch({
        type: 'SELECT_PROCESSING_OPERATOR',
        payload: { operatorId: operation.operatorId },
      });
    }

    if (operatorUI.isLiveEditable) {
      await prepareLiveChange(
        operation.uid,
        operatorUI.defaultShouldProcessAll ?? false,
      );
    }
  });

  return useMemo(
    () => ({
      apply,
      reorder,
      remove,
      removeAll,
      switchEnabled,
      prepareLiveChange,
      resetLiveChange,
      applyLiveChange,
      triggerOperation,
    }),
    [
      apply,
      applyLiveChange,
      prepareLiveChange,
      remove,
      removeAll,
      reorder,
      resetLiveChange,
      switchEnabled,
      triggerOperation,
    ],
  );
}
