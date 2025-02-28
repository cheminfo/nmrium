import type { ButtonProps } from '@blueprintjs/core';
import { Button, Popover } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

interface TabTitleProps {
  onDelete?: ButtonProps['onClick'];
  children?: ReactNode;
}

export function TabTitle(props: TabTitleProps) {
  const { onDelete, children } = props;

  function handleOnDelete(event) {
    event.stopPropagation();
    onDelete?.(event);
  }

  return (
    <Popover
      minimal
      popoverClassName="popover-tab"
      position="top-left"
      interactionKind="hover"
      enforceFocus={false}
      disabled={typeof onDelete !== 'function'}
      content={
        <TabCloseButton
          icon="cross"
          intent="danger"
          className="tab-close-btn"
          onClick={handleOnDelete}
          size="small"
        />
      }
    >
      {children}
    </Popover>
  );
}

const TabCloseButton = styled(Button)`
  border-radius: 50%;
  box-shadow:
    rgb(9 30 66 / 25%) 0 4px 8px -2px,
    rgb(9 30 66 / 8%) 0 0 0 1px !important;
`;
