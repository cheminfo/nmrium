import { FaCog } from 'react-icons/fa';
import { ToolbarItemProps } from 'react-science/ui';

import { ToolBarButton } from './ToolBarButton.js';

export function PreferencesButton(props: Omit<ToolbarItemProps, 'icon'>) {
  return <ToolBarButton id="preferences-button" icon={<FaCog />} {...props} />;
}
