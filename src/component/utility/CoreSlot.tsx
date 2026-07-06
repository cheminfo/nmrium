import styled from '@emotion/styled';
import type {
  PluginUIComponentProps,
  ProcessingOperatorId,
  ProcessingOperatorUIExpandedProps,
  SupportedUISlot,
} from '@zakodium/nmrium-core';
import { castSlotProps } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { useCore } from '../context/CoreContext.tsx';

type SlotProps<Slot extends SupportedUISlot> =
  Omit<Extract<PluginUIComponentProps, { slot: Slot }>, 'slot'> extends Record<
    string,
    never
  >
    ? object
    : Omit<Extract<PluginUIComponentProps, { slot: Slot }>, 'slot'>;

interface CoreSlotProps<Slot extends SupportedUISlot> {
  slot: Slot;
  fallback?: ReactNode;
}

/**
 * Render all components registered in the given slot.
 */
export function CoreSlot<Slot extends SupportedUISlot>(
  props: CoreSlotProps<Slot> & SlotProps<Slot>,
) {
  const { slot, fallback, ...slotProps } = props;
  castSlotProps(slotProps, slot);

  const core = useCore();

  const jsx = Array.from(core.slot(slot), ([key, Component]) => (
    <Component key={key} {...slotProps} slot={slot} />
  ));

  return jsx.length > 0 ? jsx : fallback;
}

interface CoreOperatorNameProps<Id extends ProcessingOperatorId> {
  id: Id;
  fallback?: ReactNode;
}

export function CoreOperatorName<Id extends ProcessingOperatorId>(
  props: CoreOperatorNameProps<Id>,
) {
  const { id, fallback } = props;
  const core = useCore();

  const operator = core.slotOperator(id);
  if (!operator) return fallback;

  return operator.name;
}

interface CoreOperatorExtendedProps<Id extends ProcessingOperatorId> {
  id: Id;
  fallback?: ReactNode;
}

export function CoreOperatorExpanded<Id extends ProcessingOperatorId>(
  props: CoreOperatorExtendedProps<Id> & ProcessingOperatorUIExpandedProps<Id>,
) {
  const { id, fallback, ...operatorProps } = props;
  const core = useCore();

  const operator = core.slotOperator(id);
  const Expanded = operator?.Expanded;
  if (!Expanded) return fallback;

  return (
    <ErrorBoundary
      fallbackRender={(props) => (
        <>
          <ErrorOverlay {...props} />
          {fallback}
        </>
      )}
    >
      <Expanded {...operatorProps} />
    </ErrorBoundary>
  );
}

function ErrorOverlay(props: FallbackProps) {
  const error = props.error;
  const message =
    error && typeof error === 'object' && 'message' in error
      ? error.message
      : null;
  const stack =
    error && typeof error === 'object' && 'stack' in error ? error.stack : null;

  return (
    <ErrorOverlayStyled>
      <p>Something went wrong.</p>
      <details>
        <summary>{message as ReactNode}</summary>
        {stack as ReactNode}
      </details>
    </ErrorOverlayStyled>
  );
}

const ErrorOverlayStyled = styled.div`
  background: white;
  padding-block: 10px;

  > p {
    margin: 0;
    text-align: center;
    font-size: 20px;
  }

  details {
    color: red;
    white-space: pre-wrap;
  }
`;
