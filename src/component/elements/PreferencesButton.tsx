import { FaCog } from 'react-icons/fa';

import { ToolBarButton, ToolBarButtonProps } from './ToolBarButton';

export function PreferencesButton({
  onClick,
}: Pick<ToolBarButtonProps, 'onClick'>) {
  return (
    <ToolBarButton id="preferences-button" icon={<FaCog />} onClick={onClick} />
  );
}
