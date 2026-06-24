import { Classes, Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ProcessingOperatorId, Spectrum } from '@zakodium/nmrium-core';
import { cast } from '@zakodium/utils';
import type { Filter1D, Filter2D } from 'nmr-processing';
import { useEffect, useMemo, useState } from 'react';
import { ObjectInspector } from 'react-inspector';
import { Button } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext.tsx';
import { useCore } from '../../context/CoreContext.tsx';
import type { AlertButton } from '../../elements/Alert.tsx';
import { useAlert } from '../../elements/Alert.tsx';
import { EmptyText } from '../../elements/EmptyText.tsx';
import { Sections } from '../../elements/Sections.tsx';
import useSpectrum from '../../hooks/useSpectrum.ts';
import type { Tool } from '../../toolbar/ToolTypes.ts';
import {
  CoreOperatorExpanded,
  CoreOperatorName,
} from '../../utility/CoreSlot.tsx';
import DefaultPanelHeader from '../header/DefaultPanelHeader.tsx';

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

const unremoveableProcessings = new Set<ProcessingOperatorId>([
  '@zakodium/nmrium-core-plugins#digitalFilter1D',
  '@zakodium/nmrium-core-plugins#digitalFilter2D',
]);

export function ProcessingsSectionsPanel() {
  const core = useCore();
  const { showAlert } = useAlert();
  const spectrum: Spectrum | undefined = useSpectrum();
  const { toolOptions } = useChartData();

  cast<FilterName>(toolOptions.data.activeFilterID);
  const selectedToolProcessing = mapToolsToProcessing[toolOptions.selectedTool];
  const activeProcessing =
    mapFiltersToProcessings[toolOptions.data.activeFilterID];
  const [openedOperation, setOpenedOperation] = useState<string>();

  const [processings, setProcessings] = useState(
    () => spectrum?.processings ?? [],
  );
  useEffect(() => {
    setProcessings(spectrum?.processings ?? []);
  }, [spectrum?.processings]);

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
        onClick: () => setProcessings([]),
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
    setOpenedOperation(
      openedOperation === operationId ? undefined : operationId,
    );
  }

  function onReorder(sourceIndex: number, targetIndex: number) {
    const newProcessings = [...processings];
    [newProcessings[sourceIndex], newProcessings[targetIndex]] = [
      newProcessings[targetIndex],
      newProcessings[sourceIndex],
    ];
    setProcessings(newProcessings);
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
          {processings?.map((operation, index) => {
            const operatorUI = core.slotOperator(operation.operatorId);
            const isOpen =
              selectedProcessing.operatorId === operation.operatorId ||
              selectedProcessing.operationId === operation.uid;
            const isEditable = operatorUI?.isEditable;

            return (
              <Sections.Item
                index={index}
                key={operation.uid}
                id={operation.uid}
                title={
                  <CoreOperatorName
                    id={operation.operatorId}
                    fallback={operation.operatorId.split('#', 2).at(-1)}
                  />
                }
                onReorder={onReorder}
                isOpen={isOpen}
                serial={index + 1}
                onClick={() => toggleSection(operation.uid)}
                rightElement={
                  <CompactControls>
                    {isEditable && (
                      <Button
                        intent="success"
                        tooltipProps={{ content: 'Edit filter' }}
                        variant="minimal"
                        onClick={() => setOpenedOperation(operation.uid)}
                        icon="annotation"
                        disabled={isOpen}
                      />
                    )}

                    <Button
                      intent="danger"
                      tooltipProps={{ content: 'Delete filter' }}
                      variant="minimal"
                      onClick={() =>
                        setProcessings(
                          processings.filter((p) => p.uid !== operation.uid),
                        )
                      }
                      disabled={unremoveableProcessings.has(
                        operation.operatorId,
                      )}
                      icon="trash"
                    />

                    <Switch
                      innerLabelChecked="On"
                      innerLabel="Off"
                      checked={operation.enabled || false}
                      onChange={() => {
                        setProcessings(
                          processings.map((p) =>
                            p.uid === operation.uid
                              ? { ...operation, enabled: !operation.enabled }
                              : p,
                          ),
                        );
                      }}
                    />
                  </CompactControls>
                }
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
            );
          })}
        </Sections>
      )}
    </>
  );
}

const CompactControls = styled.div`
  display: flex;
  align-items: center;

  .${Classes.CONTROL} {
    margin-bottom: 0;
  }
`;
