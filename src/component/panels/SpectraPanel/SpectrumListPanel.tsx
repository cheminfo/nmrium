import { CSSProperties, memo, useRef, useState } from 'react';

import PreferencesHeader from '../header/PreferencesHeader.js';

import SpectraPanelHeader from './SpectraPanelHeader.js';
import SpectraPreferences from './SpectraPreferences.js';
import SpectraTabs from './SpectraTabs.js';

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
    const isValid = settingsRef.current.saveSetting();
    if (isValid) {
      setFlipStatus(!isFlipped);
    }
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
          <SpectraTabs />
        </>
      )}
    </div>
  );
}

export default memo(SpectrumListPanel);
