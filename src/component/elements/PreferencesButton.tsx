import { FaCog } from 'react-icons/fa';

import ToolTip from './ToolTip/ToolTip';

type PreferencesButtonProps = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
>;

export function PreferencesButton({ onClick }: PreferencesButtonProps) {
  return (
    <ToolTip title="Preferences" popupPlacement="left">
      <button type="button" onClick={onClick}>
        <FaCog />
      </button>
    </ToolTip>
  );
}
