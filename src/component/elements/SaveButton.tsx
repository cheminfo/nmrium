import { FaCheck } from 'react-icons/fa';
import { ToolbarItemProps } from 'react-science/ui';

import { ToolBarButton } from './ToolBarButton.js';

export function SaveButton(
  props: Pick<ToolbarItemProps, 'onClick' | 'tooltip'>,
) {
  return (
    <ToolBarButton
      id="save-button"
      {...props}
      intent="success"
      icon={<FaCheck />}
    />
  );
}
