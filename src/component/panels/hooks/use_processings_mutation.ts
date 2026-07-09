import type {
  Spectrum,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';
import { sliceSpectrum } from '@zakodium/nmrium-core';
import { noop } from '@zakodium/utils';
import type { Draft } from 'immer';

import { initializeContoursLevels } from '../../../data/data2d/Spectrum2D/contours.ts';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/index.ts';
import { useChartData } from '../../context/ChartContext.tsx';
import { useCore } from '../../context/CoreContext.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import type { State } from '../../reducer/Reducer.ts';
import { setDomain, setMode } from '../../reducer/actions/DomainActions.ts';
import { updateView } from '../../reducer/actions/FiltersActions.ts';
import { resetSelectedTool } from '../../reducer/actions/ToolsActions.ts';
import zoomHistoryManager from '../../reducer/helper/ZoomHistoryManager.ts';
import { getActiveSpectrum } from '../../reducer/helper/getActiveSpectrum.ts';

export type ProcessingsMutations = ReturnType<typeof useProcessingsMutations>;

export function useProcessingsMutations() {
  const core = useCore();
  const state = useChartData();
  const dispatch = useDispatch();

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
        onProduce,
      },
    });
  }

  return {
    async apply(
      operation: SpectrumProcessingOperation<any, any>,
      indexOperation: number,
    ) {
      const { spectrum, indexSpectrum } = getSpectrum();

      if (!spectrum?.processings) return;
      if (indexOperation > spectrum.processings.length) return;

      spectrum.processings[indexOperation] = operation;

      await submit(spectrum, indexSpectrum, (draft) => {
        const {
          domainUpdateRules = {
            updateXDomain: false,
            updateYDomain: false,
          },
        } = core.getOperator(operation.operatorId) ?? {};
        updateView(draft, domainUpdateRules);
      });
    },

    async reorder(sourceIndex: number, targetIndex: number) {
      const { spectrum, indexSpectrum } = getSpectrum();
      if (!spectrum?.processings) return;

      [spectrum.processings[sourceIndex], spectrum.processings[targetIndex]] = [
        spectrum.processings[targetIndex],
        spectrum.processings[sourceIndex],
      ];

      await submit(spectrum, indexSpectrum, noop);
    },

    async remove(uid: string) {
      const { spectrum, indexSpectrum } = getSpectrum();
      if (!spectrum?.processings) return;

      spectrum.processings = spectrum.processings.filter((p) => p.uid !== uid);

      await submit(spectrum, indexSpectrum, (draft) => {
        draft.toolOptions.data.activeFilterID = null;
        resetSelectedTool(draft);
        setDomain(draft);
        setMode(draft);
      });
    },

    async removeAll() {
      const { spectrum, indexSpectrum } = getSpectrum();

      if (!spectrum?.processings) return;
      if (spectrum.processings.length === 0) return;

      spectrum.processings = [];

      await submit(spectrum, indexSpectrum, (draft) => {
        draft.toolOptions.data.activeFilterID = null;
        resetSelectedTool(draft);
        setDomain(draft);
        setMode(draft);
      });
    },

    async switchEnabled(uid: string) {
      const { spectrum, indexSpectrum } = getSpectrum();
      if (!spectrum?.processings) return;

      const operationIndex = spectrum.processings.findIndex(
        (p) => p.uid === uid,
      );
      if (operationIndex === -1) return;

      const operation = spectrum.processings[operationIndex];
      operation.enabled = !operation.enabled;

      await submit(spectrum, indexSpectrum, (draft, processedSpectrum) => {
        if (isSpectrum2D(processedSpectrum) && processedSpectrum.info.isFt) {
          draft.view.spectraContourLevels[processedSpectrum.id] =
            initializeContoursLevels(processedSpectrum);
        }

        resetSelectedTool(draft);
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
    },
  };
}
