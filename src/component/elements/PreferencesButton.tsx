import { FaCog } from 'react-icons/fa';
import { Toolbar, ToolbarItemProps } from 'react-science/ui';

type PreferencesButtonProps = Pick<ToolbarItemProps, 'onClick'>;

export function PreferencesButton({ onClick }: PreferencesButtonProps) {
  return (
    <Toolbar>
      <Toolbar.Item icon={<FaCog />} title="Preferences" onClick={onClick} />
    </Toolbar>
  );
}
