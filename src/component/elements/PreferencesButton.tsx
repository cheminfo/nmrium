import { FaCog } from 'react-icons/fa';

import { ToolBarButton, ToolBarButtonProps } from './ToolBarButton';

export function PreferencesButton({
  onClick,
}: Pick<ToolBarButtonProps, 'onClick'>) {
  return <ToolBarButton icon={<FaCog />} onClick={onClick} />;
}
