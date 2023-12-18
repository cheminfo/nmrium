import { FaCheck } from 'react-icons/fa';

import { ToolBarButton, ToolBarButtonProps } from './ToolBarButton';

export function SaveButton(
  props: Pick<ToolBarButtonProps, 'onClick' | 'title'>,
) {
  return (
    <ToolBarButton
      {...props}
      intent="success"
      icon={<FaCheck />}
      placement="bottom-start"
    />
  );
}
