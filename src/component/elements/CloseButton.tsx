import { FaTimes } from 'react-icons/fa';
import type { ToolbarItemProps } from 'react-science/ui';

import { ToolbarButton } from './toolbar_button.tsx';

export function CloseButton(
  props: Pick<ToolbarItemProps, 'onClick' | 'tooltip'>,
) {
  return (
    <ToolbarButton
      id="close-button"
      {...props}
      intent="danger"
      icon={<FaTimes />}
    />
  );
}
