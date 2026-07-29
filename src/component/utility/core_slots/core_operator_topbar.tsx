import styled from '@emotion/styled';
import type {
  ProcessingOperatorId,
  ProcessingOperatorUISettingsFormProps,
} from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { useCore } from '../../context/CoreContext.tsx';

interface CoreOperatorTopBarProps<Id extends ProcessingOperatorId> {
  id: Id;
}

export function CoreOperatorTopBar<Id extends ProcessingOperatorId>(
  props: CoreOperatorTopBarProps<Id> &
    ProcessingOperatorUISettingsFormProps<Id>,
) {
  const { id, ...operatorProps } = props;
  const core = useCore();

  const operator = core.slotOperator(id);
  const TopBar = operator?.TopBar;
  if (!TopBar) return null;

  return (
    <ErrorBoundary fallbackRender={(props) => <ErrorOverlay {...props} />}>
      <TopBar {...operatorProps} />
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
  display: flex;
  gap: 5px;

  > p {
    margin: 0;
    font-size: 20px;
  }

  details {
    color: red;
    white-space: pre-wrap;
  }
`;
