import { Classes, Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type {
  ProcessingOperatorId,
  SpectrumProcessingOperation,
} from '@zakodium/nmrium-core';
import { Button } from 'react-science/ui';

import type { ProcessingsMutations } from '../../../context/processings_mutations_context.api.ts';

const unremoveableProcessings = new Set<ProcessingOperatorId>([
  '@zakodium/nmrium-core-plugins#digitalFilter1D',
  '@zakodium/nmrium-core-plugins#digitalFilter2D',
]);

interface ProcessingItemExtraProps {
  operation: SpectrumProcessingOperation<unknown, unknown>;
  isOpen: boolean;
  isEditable: boolean | undefined;
  selectProcessingOperator: (
    operatorId: ProcessingOperatorId | undefined,
  ) => void;
  processingsMutations: ProcessingsMutations;
}

export function ProcessingItemExtra(props: ProcessingItemExtraProps) {
  const {
    operation,
    isOpen,
    isEditable,
    selectProcessingOperator,
    processingsMutations,
  } = props;

  return (
    <CompactControls>
      {isEditable && (
        <Button
          tooltipProps={{ content: 'Edit filter' }}
          intent="success"
          variant="minimal"
          onClick={() => selectProcessingOperator(operation.operatorId)}
          icon="annotation"
          disabled={isOpen}
        />
      )}

      <Button
        tooltipProps={{ content: 'Delete filter' }}
        intent="danger"
        variant="minimal"
        onClick={() => processingsMutations.remove(operation.uid)}
        disabled={unremoveableProcessings.has(operation.operatorId)}
        icon="trash"
      />

      <Switch
        checked={operation.enabled ?? false}
        innerLabelChecked="On"
        innerLabel="Off"
        onChange={() => processingsMutations.switchEnabled(operation.uid)}
      />
    </CompactControls>
  );
}

const CompactControls = styled.div`
  display: flex;
  align-items: center;

  .${Classes.CONTROL} {
    margin-bottom: 0;
  }
`;
