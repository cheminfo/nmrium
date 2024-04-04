import { CloseButton } from '../../elements/CloseButton';
import { SaveButton } from '../../elements/SaveButton';

interface PreferencesHeaderProps {
  onClose: () => void;
  onSave: () => void;
}

function PreferencesHeader({ onClose, onSave }: PreferencesHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        borderBottom: '0.55px solid rgb(240 240 240)',
      }}
    >
      <CloseButton onClick={onClose} tooltip="Close preferences" />
      <SaveButton onClick={onSave} tooltip="Save preferences" />
    </div>
  );
}

export default PreferencesHeader;
