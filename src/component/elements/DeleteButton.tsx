import { ButtonProps } from '@blueprintjs/core';
import { FaRegTrashAlt } from 'react-icons/fa';

import { ToolBarButton } from './ToolBarButton';

interface DeleteButtonProps
  extends Pick<ButtonProps, 'onClick' | 'title' | 'disabled' | 'active'> {
  title: string;
}

export function DeleteButton(props: DeleteButtonProps) {
  return (
    <ToolBarButton
      intent="danger"
      {...props}
      id="delete-button"
      icon={<FaRegTrashAlt />}
    />
  );
}
