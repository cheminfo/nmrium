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
      style={{
        fontSize: '1.125em',
      }}
      {...props}
      id="delete-button"
      icon={<FaRegTrashAlt />}
    />
  );
}
