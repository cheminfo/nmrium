import { FaCheck, FaTimes } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

interface PreferencesHeaderProps {
  onClose: () => void;
  onSave: () => void;
}

export default function PreferencesHeader({
  onClose,
  onSave,
}: PreferencesHeaderProps) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end' }}
    >
      <Toolbar aria-label="Panel preferences toolbar">
        <Toolbar.Item
          id="save-button"
          onClick={onSave}
          tooltip="Save preferences"
          intent="success"
          icon={<FaCheck />}
        />
        <Toolbar.Item
          id="close-button"
          tooltip="Close preferences"
          onClick={onClose}
          intent="danger"
          icon={<FaTimes />}
        />
      </Toolbar>
    </div>
  );
}
