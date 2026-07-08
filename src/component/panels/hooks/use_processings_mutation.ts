import type {
  DomainUpdateRules,
  NMRiumCore,
  Spectrum,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';

import { useChartData } from '../../context/ChartContext.tsx';
import { useCore } from '../../context/CoreContext.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import { getActiveSpectrum } from '../../reducer/helper/getActiveSpectrum.ts';

interface ApplyProcessingOperationMutation {
  indexOperation: number;
  operation: SpectrumProcessingOperation<any, any>;
}

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

  function getSpectrum() {
    const activeSpectrum = getActiveSpectrum(state);
    if (!activeSpectrum) return {};
    const indexSpectrum = activeSpectrum.index;
    const spectrum = { ...state.data[indexSpectrum] };

    if (spectrum.processings) {
      spectrum.processings = spectrum.processings.map((p) => ({ ...p }));
    }

    return { spectrum, indexSpectrum };
  }

  async function submit(spectrum: Spectrum, index: number) {
    setIsLoading(true);
    const processedSpectrum = await core
      .processSpectrum(spectrum)
      .finally(() => setIsLoading(false));

    dispatch({
      type: 'SET_SPECTRUM',
      payload: {
        index,
        spectrum: processedSpectrum,
        updateDomainRules: aggregateDomains(spectrum, core),
      },
    });
  }

  return {
    async apply(payload: ApplyProcessingOperationMutation) {
      const { spectrum, indexSpectrum } = getSpectrum();
      const { indexOperation, operation } = payload;

      if (!spectrum?.processings) return;
      if (indexOperation > spectrum.processings.length) return;

      spectrum.processings = spectrum.processings.slice();
      spectrum.processings[indexSpectrum] = operation;

      await submit(spectrum, indexSpectrum);
    },

    async removeAll() {
      const { spectrum, indexSpectrum } = getSpectrum();

      if (!spectrum?.processings) return;
      if (spectrum.processings.length === 0) return;

      spectrum.processings = [];

      await submit(spectrum, indexSpectrum);
    },

    async reorder(sourceIndex: number, targetIndex: number) {
      const { spectrum, indexSpectrum } = getSpectrum();
      if (!spectrum?.processings) return;

      const processings = [...spectrum.processings];
      [processings[sourceIndex], processings[targetIndex]] = [
        processings[targetIndex],
        processings[sourceIndex],
      ];

      await submit(spectrum, indexSpectrum);
    },

    async remove(uid: string) {
      const { spectrum, indexSpectrum } = getSpectrum();
      if (!spectrum?.processings) return;

      spectrum.processings = spectrum.processings.filter((p) => p.uid !== uid);

      await submit(spectrum, indexSpectrum);
    },

    async switchEnabled(uid: string) {
      const { spectrum, indexSpectrum } = getSpectrum();
      if (!spectrum?.processings) return;

      const operationIndex = spectrum.processings.findIndex(
        (p) => p.uid === uid,
      );
      if (operationIndex === -1) return;

      const operation = { ...spectrum.processings[operationIndex] };
      operation.enabled = !operation.enabled;
      spectrum.processings[operationIndex] = operation;

      await submit(spectrum, indexSpectrum);
    },
  };
}

function aggregateDomains(
  spectrum: Spectrum,
  core: NMRiumCore,
): DomainUpdateRules {
  let updateYDomain = false;
  let updateXDomain = false;

  for (const operation of spectrum.processings ?? []) {
    const operator = core.getOperator(operation.operatorId);
    if (!operator) continue;

    if (operator.domainUpdateRules.updateXDomain) updateXDomain = true;
    if (operator.domainUpdateRules.updateYDomain) updateYDomain = true;
  }

  return { updateXDomain, updateYDomain };
}
