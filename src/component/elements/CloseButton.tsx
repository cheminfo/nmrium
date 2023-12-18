import { FaTimes } from 'react-icons/fa';

import { ToolBarButton, ToolBarButtonProps } from './ToolBarButton';

export function CloseButton(
  props: Pick<ToolBarButtonProps, 'onClick' | 'title' | 'className'>,
) {
  return (
    <ToolBarButton
      {...props}
      intent="danger"
      icon={<FaTimes />}
      placement="bottom-start"
    />
  );
}
