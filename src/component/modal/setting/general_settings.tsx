import { FaWrench } from 'react-icons/fa';
import { Toolbar, useOnOff } from 'react-science/ui';

import { useSaveSettings } from '../../hooks/useSaveSettings.js';

import { GeneralSettingsDialog } from './tanstack_general_settings/general_settings.js';

interface GeneralSettingsModalProps {
  height?: number;
}

export function GeneralSettingsToolbarItem(props: GeneralSettingsModalProps) {
  const [isOpen, open, close] = useOnOff(false);

  const { saveSettings, SaveSettingsModal } = useSaveSettings();

  return (
    <>
      <Toolbar.Item
        id="general-settings"
        onClick={open}
        tooltip="General settings"
        icon={<FaWrench />}
      />

      <GeneralSettingsDialog
        height={props.height}
        isOpen={isOpen}
        close={close}
        onSave={saveSettings}
      />
      <SaveSettingsModal />
    </>
  );
}
