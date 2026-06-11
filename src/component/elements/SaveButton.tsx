import { FaCheck } from 'react-icons/fa';
import type { ToolbarItemProps } from 'react-science/ui';

import { ToolbarButton } from './toolbar_button.tsx';

export function SaveButton(
  props: Pick<ToolbarItemProps, 'onClick' | 'tooltip'>,
) {
  return (
    <ToolbarButton
      id="save-button"
      {...props}
      intent="success"
      icon={<FaCheck />}
    />
  );
}
