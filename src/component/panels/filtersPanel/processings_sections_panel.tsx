import type {
  ProcessingOperatorId,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import { useProcessingsMutations } from '../../context/processings_mutations_context.tsx';
import type { AlertButton } from '../../elements/Alert.tsx';
import { useAlert } from '../../elements/Alert.tsx';
import { EmptyText } from '../../elements/EmptyText.tsx';
import { Sections } from '../../elements/Sections.tsx';
import { useStableSpectrum } from '../../hooks/useSpectrum.ts';
import DefaultPanelHeader from '../header/DefaultPanelHeader.tsx';

import { ProcessingItem } from './processings/processing_item.tsx';

export function ProcessingsSectionsPanel() {
  const { showAlert } = useAlert();
  const spectrum = useStableSpectrum();
  const {
    processingOperators: { selected },
  } = useChartData();
  const dispatch = useDispatch();
  const processingsMutations = useProcessingsMutations();

  const processings = spectrum?.processings ?? [];

  const processingsStatus = useMemo(() => {
    const processings: Array<{
      operation: SpectrumProcessingOperation<unknown, unknown>;
      isOpen: boolean;
      isAfterOpen: boolean;
    }> = [];
    let isAfterOpen = false;

    for (const operation of spectrum?.processings ?? []) {
      const isOpen = selected === operation.operatorId;

      processings.push({ isOpen, isAfterOpen, operation });

      if (isOpen) {
        isAfterOpen = true;
      }
    }

    return processings;
  }, [selected, spectrum?.processings]);

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

  function selectProcessingOperator(
    operatorId: ProcessingOperatorId | undefined,
  ) {
    dispatch({
      type: 'SELECT_PROCESSING_OPERATOR',
      payload: { operatorId },
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
          {processingsStatus.map(
            ({ operation, isOpen, isAfterOpen }, index) => (
              <ProcessingItem
                key={operation.uid}
                operation={operation}
                operationIndex={index}
                isOpen={isOpen}
                isAfterOpen={isAfterOpen}
                selectProcessingOperator={selectProcessingOperator}
                processingsMutations={processingsMutations}
              />
            ),
          )}
        </Sections>
      )}
    </>
  );
}
