import type {
  ProcessingOperatorId,
  SpectrumProcessingOperation,
} from '@zakodium/nmr-types';
import type { ProcessingOperatorUI } from '@zakodium/nmrium-core';
import { useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { PanelHeader, Toolbar } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext.tsx';
import { useCore } from '../../context/CoreContext.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import { useProcessingsMutations } from '../../context/processings_mutations_context.tsx';
import type { AlertButton } from '../../elements/Alert.tsx';
import { useAlert } from '../../elements/Alert.tsx';
import { EmptyText } from '../../elements/EmptyText.tsx';
import { Sections } from '../../elements/Sections.tsx';
import { useStableSpectrum } from '../../hooks/useSpectrum.ts';
import { CoreOperatorPanelTool } from '../../utility/core_slots/core_operator_panel_tool.tsx';

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

  const core = useCore();
  const operatorsUI = useMemo(() => core.slotOperators(), [core]);

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
    operatorUI: ProcessingOperatorUI<ProcessingOperatorId> | undefined,
    operation: SpectrumProcessingOperation<unknown, unknown>,
  ) {
    if (operatorUI) {
      void processingsMutations.triggerOperation(operation);
    } else {
      dispatch({
        type: 'SELECT_PROCESSING_OPERATOR',
        payload: { operatorUI: undefined },
      });
    }
  }

  if (!spectrum) return null;

  return (
    <>
      <PanelHeader>
        <Toolbar overflow="collapse">
          <Toolbar.Item
            id="delete-button"
            onClick={handleDeleteFilter}
            tooltip="Delete all filters"
            icon={<FaRegTrashAlt />}
            intent="danger"
            disabled={!processings?.length}
          />
          {operatorsUI.map((operatorUI) => (
            <CoreOperatorPanelTool
              key={operatorUI.id}
              operatorUI={operatorUI}
              activeOperatorId={selected}
              spectrum={spectrum}
              onTriggerOperation={(operation) =>
                void processingsMutations.triggerOperation(operation)
              }
            />
          ))}
        </Toolbar>
      </PanelHeader>

      {processingsStatus.length === 0 && <EmptyText text="No Processings" />}
      {processingsStatus.length > 0 && (
        <Sections isOverflow renderActiveSectionContentOnly>
          {processingsStatus.map(
            ({ operation, isOpen, isAfterOpen }, index) => (
              <ProcessingItem
                key={operation.uid}
                operation={operation}
                operationIndex={index}
                isOpen={isOpen}
                isAfterOpen={isAfterOpen}
                selectProcessingOperator={(operatorUI) =>
                  selectProcessingOperator(operatorUI, operation)
                }
                processingsMutations={processingsMutations}
                spectrum={spectrum}
              />
            ),
          )}
        </Sections>
      )}
    </>
  );
}
