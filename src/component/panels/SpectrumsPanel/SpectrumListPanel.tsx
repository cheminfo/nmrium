import { useCallback, memo, useState, CSSProperties, useRef } from 'react';

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
  const [spectra, setSpectra] = useState<Array<any>>([]);

  const [isFlipped, setFlipStatus] = useState(false);

  function settingsPanelHandler() {
    setFlipStatus(!isFlipped);
  }

  function saveSettingHandler() {
    settingsRef.current.saveSetting();
    setFlipStatus(!isFlipped);
  }

  const tabChangeHandler = useCallback((e) => {
    setSpectra(e.data || []);
  }, []);

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
          <SpectraPanelHeader
            spectrums={spectra}
            onSettingClick={settingsPanelHandler}
          />
          <SpectrumsTabs onTabChange={tabChangeHandler} />
        </>
      )}
    </div>
  );
}

export default memo(SpectrumListPanel);
