import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef,
  useMemo,
  memo,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import FormikForm from '../../elements/formik/FormikForm';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import {
  NucleusPreferences,
  NucleusPreferenceField,
} from '../extra/preferences/NucleusPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'δ (ppm) :',
    checkControllerName: 'deltaPPM.show',
    formatControllerName: 'deltaPPM.format',
    hideCheckField: true,
  },
];

function ZonesPreferences(props, ref) {
  const alert = useAlert();
  const formRef = useRef<any>();

  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const zonesPreferences = usePanelPreferencesByNuclei('zones', nuclei);

  useEffect(() => {
    formRef.current.setValues(zonesPreferences);
  }, [zonesPreferences]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'zones', value: values },
      });
      alert.success('zones preferences saved successfully');
    },
    [alert, preferences],
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
    <PreferencesContainer>
      <FormikForm onSubmit={saveHandler} ref={formRef}>
        {nuclei?.map((n) => (
          <NucleusPreferences key={n} nucleus={n} fields={formatFields} />
        ))}
      </FormikForm>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(ZonesPreferences));
