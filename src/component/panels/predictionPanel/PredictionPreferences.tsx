import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import { usePreferences } from '../../context/PreferencesContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';

import PredictionOptionsPanel from './PredictionOptionsPanel.js';

function PredictionPreferences(props: any, ref: any) {
  const formRef = useRef<SettingsRef | null>(null);
  const preferences = usePreferences();
  const predictionPreferences = usePanelPreferences('prediction');

  const saveHandler = useCallback(
    (values: any) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'prediction', value: values },
      });
    },
    [preferences],
  );

  useImperativeHandle(
    ref,
    () => ({
      saveSetting: () => {
        return formRef.current?.saveSetting();
      },
    }),
    [],
  );

  return (
    <PreferencesContainer style={{ backgroundColor: 'white' }}>
      <PredictionOptionsPanel
        onSave={saveHandler}
        options={predictionPreferences}
        ref={formRef}
        hideName
      />
    </PreferencesContainer>
  );
}

export default forwardRef(PredictionPreferences);
