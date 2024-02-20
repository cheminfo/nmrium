import { FaTimes } from 'react-icons/fa';

import { ToolBarButton, ToolBarButtonProps } from './ToolBarButton';

export function CloseButton(
  props: Pick<ToolBarButtonProps, 'onClick' | 'title' | 'className'>,
) {
  return (
    <ToolBarButton
      id="close-button"
      {...props}
      intent="danger"
      icon={<FaTimes />}
      placement="bottom-start"
    />
  );
}
