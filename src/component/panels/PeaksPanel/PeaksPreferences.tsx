import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  memo,
  forwardRef,
  useMemo,
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
    label: 'Peak Number :',
    checkControllerName: 'peakNumber.show',
    formatControllerName: 'peakNumber.format',
  },
  {
    id: 2,
    label: 'δ (ppm) :',
    checkControllerName: 'deltaPPM.show',
    formatControllerName: 'deltaPPM.format',
  },
  {
    id: 3,
    label: 'δ (Hz) :',
    checkControllerName: 'deltaHz.show',
    formatControllerName: 'deltaHz.format',
  },
  {
    id: 4,
    label: 'Peak Width (Hz)',
    checkControllerName: 'peakWidth.show',
    formatControllerName: 'peakWidth.format',
  },
  {
    id: 5,
    label: 'Intensity :',
    checkControllerName: 'intensity.show',
    formatControllerName: 'intensity.format',
  },
  {
    id: 6,
    label: 'kind :',
    checkControllerName: 'fwhm.show',
  },
  {
    id: 7,
    label: 'fwhm :',
    checkControllerName: 'fwhm.show',
    formatControllerName: 'fwhm.format',
  },
  {
    id: 8,
    label: 'mu :',
    checkControllerName: 'mu.show',
    formatControllerName: 'mu.format',
  },
];

function PeaksPreferences(props, ref: any) {
  const alert = useAlert();
  const formRef = useRef<any>(null);
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('peaks', nuclei);

  useEffect(() => {
    formRef.current.setValues(preferencesByNuclei);
  }, [preferencesByNuclei]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'peaks', value: values },
      });
      alert.success('Peaks preferences saved successfully');
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

export default memo(forwardRef(PeaksPreferences));
