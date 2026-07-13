import type {
  ProcessingOperatorId,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';
import { cast } from '@zakodium/utils';
import type { Filter1D, Filter2D } from 'nmr-processing';
import { useMemo, useState } from 'react';

import { useChartData } from '../../context/ChartContext.tsx';
import type { AlertButton } from '../../elements/Alert.tsx';
import { useAlert } from '../../elements/Alert.tsx';
import { EmptyText } from '../../elements/EmptyText.tsx';
import { Sections } from '../../elements/Sections.tsx';
import useSpectrum from '../../hooks/useSpectrum.ts';
import type { Tool } from '../../toolbar/ToolTypes.ts';
import DefaultPanelHeader from '../header/DefaultPanelHeader.tsx';
import { useProcessingsMutations } from '../hooks/use_processings_mutation.ts';

import { ProcessingItem } from './processings/processing_item.tsx';

const mapToolsToProcessing: Partial<Record<Tool, ProcessingOperatorId>> = {
  apodization: '@zakodium/nmrium-core-plugins#apodization1D',
  zeroFilling: '@zakodium/nmrium-core-plugins#zeroFilling1D',
  fft: '@zakodium/nmrium-core-plugins#fft1D',
  phaseCorrection: '@zakodium/nmrium-core-plugins#phaseCorrection1D',
};

type FilterName = Filter1D['name'] | Filter2D['name'];
const mapFiltersToProcessings: Partial<
  Record<FilterName, ProcessingOperatorId>
> = {
  apodization: '@zakodium/nmrium-core-plugins#apodization1D',
  digitalFilter: '@zakodium/nmrium-core-plugins#digitalFilter1D',
  fft: '@zakodium/nmrium-core-plugins#fft1D',
  phaseCorrection: '@zakodium/nmrium-core-plugins#phaseCorrection1D',
  shiftX: '@zakodium/nmrium-core-plugins#shiftX1D',
  zeroFilling: '@zakodium/nmrium-core-plugins#zeroFilling1D',
};

export function ProcessingsSectionsPanel() {
  const { showAlert } = useAlert();
  const spectrum = useSpectrum();
  const { toolOptions } = useChartData();
  const processingsMutations = useProcessingsMutations();

  cast<FilterName>(toolOptions.data.activeFilterID);
  const selectedToolProcessing = mapToolsToProcessing[toolOptions.selectedTool];
  const activeProcessing =
    mapFiltersToProcessings[toolOptions.data.activeFilterID];
  const [openedOperation, setOpenedOperation] =
    useState<SpectrumProcessingOperation<unknown, unknown>['uid']>();

  const processings = spectrum?.processings ?? [];

  const selectedProcessing = useMemo<{
    operatorId?: ProcessingOperatorId;
    operationId?: string;
  }>(() => {
    if (selectedToolProcessing) return { operatorId: selectedToolProcessing };
    if (
      activeProcessing &&
      spectrum?.processings?.some((p) => p.operatorId === activeProcessing)
    ) {
      return { operatorId: activeProcessing };
    }

    return { operationId: openedOperation };
  }, [
    activeProcessing,
    openedOperation,
    selectedToolProcessing,
    spectrum?.processings,
  ]);

  function handleDeleteFilter() {
    const buttons: AlertButton[] = [
      {
        text: 'Yes',
        intent: 'danger',
        onClick: () => void processingsMutations.removeAll(),
      },
      { text: 'No' },
    ];

    showAlert({
      message:
        'You are about to delete all processing steps, Are you sure?. Experimental, not implemented yet',
      buttons,
    });
  }

  if (!spectrum) return null;

  return (
    <>
      <DefaultPanelHeader
        deleteTooltip="Delete all filters"
        onDelete={handleDeleteFilter}
        total={processings?.length}
        hideCounter
      />

      {processings.length === 0 && <EmptyText text="No Processings" />}
      {processings.length > 0 && (
        <Sections isOverflow renderActiveSectionContentOnly>
          {processings?.map((operation, index) => (
            <ProcessingItem
              key={operation.uid}
              operation={operation}
              operationIndex={index}
              selectedProcessing={selectedProcessing}
              setOpenedOperation={setOpenedOperation}
              processingsMutations={processingsMutations}
            />
          ))}
        </Sections>
      )}
    </>
  );
}
