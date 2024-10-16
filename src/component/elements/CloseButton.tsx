import { FaTimes } from 'react-icons/fa';
import { ToolbarItemProps } from 'react-science/ui';

import { ToolBarButton } from './ToolBarButton.js';

export function CloseButton(
  props: Pick<ToolbarItemProps, 'onClick' | 'tooltip'>,
) {
  return (
    <ToolBarButton
      id="close-button"
      {...props}
      intent="danger"
      icon={<FaTimes />}
    />
  );
}
