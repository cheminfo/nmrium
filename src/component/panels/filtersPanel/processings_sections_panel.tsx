import { useState } from 'react';
import { ObjectInspector } from 'react-inspector';

import type { AlertButton } from '../../elements/Alert.tsx';
import { useAlert } from '../../elements/Alert.tsx';
import { EmptyText } from '../../elements/EmptyText.tsx';
import { Sections } from '../../elements/Sections.tsx';
import useSpectrum from '../../hooks/useSpectrum.ts';
import {
  CoreOperatorExpanded,
  CoreOperatorName,
} from '../../utility/CoreSlot.tsx';
import DefaultPanelHeader from '../header/DefaultPanelHeader.tsx';

export function ProcessingsSectionsPanel() {
  const { showAlert } = useAlert();
  const { processings } = useSpectrum({ filters: [] });
  const [openedOperation, setOpenedOperation] = useState<string | null>(null);

  function handleDeleteFilter() {
    const buttons: AlertButton[] = [
      {
        text: 'Yes',
        intent: 'danger',
      },
      { text: 'No' },
    ];

    showAlert({
      message:
        'You are about to delete all processing steps, Are you sure?. Experimental, not implemented yet',
      buttons,
    });
  }

  function toggleSection(operationId: string) {
    setOpenedOperation(openedOperation === operationId ? null : operationId);
  }

  return (
    <>
      <DefaultPanelHeader
        deleteTooltip="Delete all filters"
        onDelete={handleDeleteFilter}
        total={processings?.length}
        hideCounter
      />

      <Sections isOverflow renderActiveSectionContentOnly>
        {processings?.map((operation, index) => (
          <Sections.Item
            key={operation.uid}
            id={operation.uid}
            title={
              <CoreOperatorName
                id={operation.operatorId}
                fallback={operation.operatorId.split('#', 2).at(-1)}
              />
            }
            isOpen={openedOperation === operation.uid}
            serial={index + 1}
            onClick={() => toggleSection(operation.uid)}
          >
            <Sections.Body>
              <CoreOperatorExpanded
                id={operation.operatorId}
                fallback={
                  operation.settings !== null ? (
                    <ObjectInspector
                      data={{
                        settings: operation.settings,
                        options: operation.options,
                      }}
                    />
                  ) : (
                    <EmptyText text=" No options available" />
                  )
                }
                operation={operation}
              />
            </Sections.Body>
          </Sections.Item>
        ))}
      </Sections>
    </>
  );
}
