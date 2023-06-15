import { useCallback, useImperativeHandle, useRef, forwardRef } from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

import PredictionOptionsPanel from './PredictionOptionsPanel';

function PredictionPreferences(props, ref: any) {
  const formRef = useRef<any>(null);
  const preferences = usePreferences();
  const predictionPreferences = usePanelPreferences('prediction');

  const saveHandler = useCallback(
    (values) => {
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
        formRef.current.submitForm();
      },
    }),
    [],
  );

  return (
    <PreferencesContainer style={{ backgroundColor: 'white' }}>
      <PredictionOptionsPanel
        onSubmit={saveHandler}
        options={predictionPreferences}
        ref={formRef}
        hideName
      />
    </PreferencesContainer>
  );
}

export default forwardRef(PredictionPreferences);
