import type { SpectrumProcessingOperation } from '@zakodium/nmrium-core';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import { ObjectInspector } from 'react-inspector';

import { useCore } from '../../../context/CoreContext.tsx';
import { EmptyText } from '../../../elements/EmptyText.tsx';
import { Sections } from '../../../elements/Sections.tsx';
import {
  CoreOperatorExpanded,
  CoreOperatorName,
} from '../../../utility/CoreSlot.tsx';
import type { ProcessingsMutations } from '../../hooks/use_processings_mutation.ts';

import { OperatorEditBanner } from './operator_edit_banner.tsx';
import { ProcessingItemExtra } from './processing_item_extra.tsx';
import { useLiveEdit } from './use_live_edit.ts';

type SPO = SpectrumProcessingOperation<unknown, unknown>;

interface ProcessingItemProps {
  operation: SPO;
  operationIndex: number;
  selectedProcessing: {
    operatorId?: string;
    operationId?: string;
  };
  processingsMutations: ProcessingsMutations;
  setOpenedOperation: Dispatch<SetStateAction<SPO['uid'] | undefined>>;
}

export function ProcessingItem(props: ProcessingItemProps) {
  const {
    operation,
    operationIndex,
    selectedProcessing,
    processingsMutations,
    setOpenedOperation,
  } = props;

  const core = useCore();

  const operatorUI = core.slotOperator(operation.operatorId);
  const isOpen =
    selectedProcessing.operatorId === operation.operatorId ||
    selectedProcessing.operationId === operation.uid;
  const isEditable = operatorUI?.isEditable;
  const isLiveEditable = operatorUI?.isLiveEditable;

  const liveEdit = useLiveEdit(
    isLiveEditable,
    operatorUI?.defaultShouldProcessAll,
  );
  const liveEditRef = useRef(liveEdit);

  const processingsMutationsRef = useRef(processingsMutations);
  processingsMutationsRef.current = processingsMutations;

  const liveOperationRef =
    useRef<SpectrumProcessingOperation<unknown, unknown>>(operation);

  useEffect(() => {
    const processingsMutations = processingsMutationsRef.current;

    if (liveEdit.value?.checked !== liveEditRef.current.value?.checked) {
      if (liveEdit.value?.checked) {
        void processingsMutations.prepareLiveChange(
          operation.uid,
          liveEdit.value.shouldProcessNext,
        );
      } else {
        void processingsMutations.resetLiveChange();
      }
    }

    if (
      liveEdit.value?.shouldProcessNext !==
      liveEditRef.current.value?.shouldProcessNext
    ) {
      void processingsMutations.applyLiveChange(
        { ...operation, options: undefined },
        liveEdit.value?.shouldProcessNext ?? false,
      );
    }

    liveEditRef.current = liveEdit;
  }, [liveEdit, operation]);

  function onReorder(sourceIndex: number, targetIndex: number) {
    void processingsMutations.reorder(sourceIndex, targetIndex);
  }

  function toggleSection(operationId: string) {
    setOpenedOperation((openedOperation) =>
      openedOperation === operationId ? undefined : operationId,
    );
  }

  return (
    <Sections.Item
      key={operation.uid}
      id={operation.uid}
      title={
        <CoreOperatorName
          id={operation.operatorId}
          fallback={operation.operatorId.split('#', 2).at(-1)}
        />
      }
      isOpen={isOpen}
      index={operationIndex}
      serial={operationIndex + 1}
      sticky
      onReorder={onReorder}
      onClick={() => toggleSection(operation.uid)}
      rightElement={
        <ProcessingItemExtra
          isOpen={isOpen}
          isEditable={isEditable}
          setOpenedOperation={setOpenedOperation}
          processingsMutations={processingsMutations}
          operation={operation}
        />
      }
    >
      <Sections.Body style={{ paddingBottom: '120px' }}>
        <CoreOperatorExpanded
          id={operation.operatorId}
          fallback={<OperationFallback operation={operation} />}
          operation={operation}
          core={core}
          onMount={() => {
            if (!liveEdit.value?.checked) return;

            void processingsMutations.prepareLiveChange(
              operation.uid,
              liveEdit.value.shouldProcessNext,
            );
          }}
          onChange={(operation) => {
            void processingsMutations.apply(
              // onChange generally change settings
              // so options should be re-computed
              { ...operation, options: undefined },
              operationIndex,
            );
            setOpenedOperation(undefined);
          }}
          onLiveChange={(liveOperation) => {
            liveOperation = { ...liveOperation, options: undefined };
            liveOperationRef.current = liveOperation;

            if (!liveEdit.value?.checked) return;

            void processingsMutations.applyLiveChange(
              liveOperation,
              liveEdit.value?.shouldProcessNext ?? false,
            );
          }}
        >
          {(children) => (
            <OperatorEditBanner
              isLiveEditable={isLiveEditable ?? false}
              liveEdit={liveEdit}
              onClose={() => setOpenedOperation(undefined)}
            >
              {children}
            </OperatorEditBanner>
          )}
        </CoreOperatorExpanded>
      </Sections.Body>
    </Sections.Item>
  );
}

interface OperationFallbackProps {
  operation: SpectrumProcessingOperation<unknown, unknown>;
}

function OperationFallback(props: OperationFallbackProps) {
  const { operation } = props;
  const { settings, options } = operation;

  if (settings === null) {
    return <EmptyText text=" No options available" />;
  }

  return <ObjectInspector data={{ settings, options }} />;
}
