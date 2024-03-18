import { memo, useState, CSSProperties, useRef } from 'react';

import PreferencesHeader from '../header/PreferencesHeader';

import SpectraPanelHeader from './SpectraPanelHeader';
import SpectraPreferences from './SpectraPreferences';
import SpectraTabs from './SpectraTabs';

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
