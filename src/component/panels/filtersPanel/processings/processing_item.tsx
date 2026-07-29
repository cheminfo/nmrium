import styled from '@emotion/styled';
import type {
  ProcessingOperatorId,
  ProcessingOperatorUI,
  Spectrum,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';
import { ObjectInspector } from 'react-inspector';

import { useCore } from '../../../context/CoreContext.tsx';
import type { ProcessingsMutations } from '../../../context/processings_mutations_context.api.ts';
import { EmptyText } from '../../../elements/EmptyText.tsx';
import { Sections } from '../../../elements/Sections.tsx';
import { CoreOperatorExpanded } from '../../../utility/core_slots/core_operator_expanded.tsx';
import { CoreOperatorName } from '../../../utility/core_slots/core_operator_name.tsx';

import { OperatorEditBanner } from './operator_edit_banner.tsx';
import { ProcessingItemExtra } from './processing_item_extra.tsx';
import { useLiveEdit } from './use_live_edit.ts';
import { useLiveOperation } from './use_live_operation.ts';

type SPO = SpectrumProcessingOperation<unknown, unknown>;

interface ProcessingItemProps {
  operation: SPO;
  operationIndex: number;
  isOpen: boolean;
  isAfterOpen: boolean;
  processingsMutations: ProcessingsMutations;
  selectProcessingOperator: (
    operatorUI: ProcessingOperatorUI<ProcessingOperatorId> | undefined,
  ) => void;
  spectrum: Spectrum;
}

export function ProcessingItem(props: ProcessingItemProps) {
  const {
    operation,
    operationIndex,
    isOpen,
    isAfterOpen,
    processingsMutations,
    selectProcessingOperator,
    spectrum,
  } = props;

  const core = useCore();

  const operatorUI = core.slotOperator(operation.operatorId);
  const isEditable = operatorUI?.isEditable;
  const isLiveEditable = operatorUI?.isLiveEditable;

  const liveEdit = useLiveEdit(operation);
  const [liveOperation, setLiveOperation] = useLiveOperation();

  function onReorder(sourceIndex: number, targetIndex: number) {
    void processingsMutations.reorder(sourceIndex, targetIndex);
  }

  function toggleSection() {
    selectProcessingOperator(isOpen ? undefined : operatorUI);
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
      onClick={() => toggleSection()}
      rightElement={
        <ProcessingItemExtra
          isOpen={isOpen}
          isEditable={isEditable}
          selectProcessingOperator={() => selectProcessingOperator(operatorUI)}
          processingsMutations={processingsMutations}
          operation={operation}
        />
      }
      headerStyle={getHeaderStyle({
        isOpen,
        operation:
          isOpen && liveEdit.value?.checked && liveOperation
            ? liveOperation
            : operation,
        isAfterOpen,
      })}
    >
      <Sections.Body style={{ paddingBottom: '120px' }}>
        <CoreOperatorExpanded
          id={operation.operatorId}
          fallback={<OperationFallback operation={operation} />}
          operation={liveOperation ?? operation}
          core={core}
          spectrum={spectrum}
          onSubmit={(operation) => {
            if (!isEditable) return;

            selectProcessingOperator(undefined);
            void processingsMutations.apply(
              // onChange generally change settings
              // so options should be re-computed
              { ...operation, options: undefined },
              operationIndex,
            );
          }}
          onChange={(liveOperation) => {
            liveOperation = setLiveOperation(liveOperation);

            if (!isLiveEditable) return;
            if (!liveEdit.value?.checked) return;

            void processingsMutations.applyLiveChange(
              liveOperation,
              liveEdit.value?.shouldProcessNext ?? false,
            );
          }}
        >
          {(submitButton) =>
            !isEditable ? null : (
              <OperatorEditBanner
                isLiveEditable={isLiveEditable ?? false}
                liveEdit={liveEdit}
                onClose={() => selectProcessingOperator(undefined)}
              >
                {submitButton}
              </OperatorEditBanner>
            )
          }
        </CoreOperatorExpanded>
        {operation.error && <ErrorRenderer>{operation.error}</ErrorRenderer>}
      </Sections.Body>
    </Sections.Item>
  );
}

interface ErrorRendererProps {
  children: ReactNode;
}
function ErrorRenderer(props: ErrorRendererProps) {
  return (
    <Pre>
      <Code>{props.children}</Code>
    </Pre>
  );
}

const Pre = styled.pre`
  display: block;
  margin-inline: -10px;
  padding-inline: 10px;
  padding-block: 5px;
  background: #ea8f8f;
`;

const Code = styled.code`
  display: block;
  max-width: 100%;
  overflow: auto;
  white-space: normal;
`;

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

interface GetHeaderStyleOptions {
  operation: SpectrumProcessingOperation<unknown, unknown>;
  isOpen: boolean;
  isAfterOpen: boolean;
}

function getHeaderStyle(options: GetHeaderStyleOptions) {
  const { operation, isOpen, isAfterOpen } = options;

  const { error } = operation;

  if (error) {
    return { backgroundColor: '#ea8f8f' };
  }

  if (isOpen) {
    return { backgroundColor: '#c2ea8f' };
  }

  if (isAfterOpen) {
    return { opacity: 0.5 };
  }

  return {};
}
