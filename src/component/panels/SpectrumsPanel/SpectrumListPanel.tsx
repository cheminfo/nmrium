import { memo, useState, CSSProperties, useRef } from 'react';

import PreferencesHeader from '../header/PreferencesHeader';

import SpectraPanelHeader from './SpectraPanelHeader';
import SpectraPreferences from './SpectraPreferences';
import SpectrumsTabs from './SpectrumsTabs';

const styles: CSSProperties = {
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

function SpectrumListPanel() {
  const settingsRef = useRef<any>();
  const [isFlipped, setFlipStatus] = useState(false);

  function settingsPanelHandler() {
    setFlipStatus(!isFlipped);
  }

  function saveSettingHandler() {
    settingsRef.current.saveSetting();
    setFlipStatus(!isFlipped);
  }

  return (
    <div style={styles}>
      {isFlipped ? (
        <>
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
          <SpectraPreferences ref={settingsRef} />
        </>
      ) : (
        <>
          <SpectraPanelHeader onSettingClick={settingsPanelHandler} />
          <SpectrumsTabs />
        </>
      )}
    </div>
  );
}

export default memo(SpectrumListPanel);
