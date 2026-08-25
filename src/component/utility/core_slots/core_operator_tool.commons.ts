import type {
  ProcessingOperatorId,
  SpectrumProcessingOperation,
} from '@zakodium/nmr-types';
import type {
  ProcessingOperatorUI,
  ProcessingOperatorUIToolProps,
} from '@zakodium/nmrium-core';
import { generateID } from '@zakodium/nmrium-core';
import type { PartialPick } from '@zakodium/utils';
import { assertDefined, assertNotNullish } from '@zakodium/utils';
import { useEventCallback } from 'usehooks-ts';

import { useCore } from '../../context/CoreContext.tsx';

interface CoreOperatorToolExtraProps {
  operatorUI: ProcessingOperatorUI<ProcessingOperatorId>;
  onTriggerOperation: (
    operation: SpectrumProcessingOperation<any, any>,
  ) => void;
}

export type CoreOperatorToolProps = PartialPick<
  Omit<ProcessingOperatorUIToolProps, 'core' | 'onTriggerOperation'>,
  'spectrum'
> &
  CoreOperatorToolExtraProps;

export function useToolProps(
  props: CoreOperatorToolProps,
): ProcessingOperatorUIToolProps | null {
  const {
    spectrum,
    activeOperatorId,
    onTriggerOperation: onTriggerOperationProp,
    operatorUI,
  } = props;
  const core = useCore();

  const onTriggerOperation = useEventCallback(() => {
    const operator = core.getOperator(operatorUI.id);
    assertNotNullish(operator);
    assertDefined(spectrum);

    onTriggerOperationProp({
      operatorId: operatorUI.id,
      uid: generateID(),
      settings: operator.getDefaultSettings(spectrum),
      options: undefined,
      enabled: true,
      error: undefined,
    });
  });

  if (!spectrum) return null;

  return {
    core,
    spectrum,
    activeOperatorId,
    onTriggerOperation,
  };
}
