import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  CSSProperties,
  memo,
  forwardRef,
  useMemo,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';

const styles: Record<
  'container' | 'groupContainer' | 'row' | 'header' | 'inputLabel' | 'input',
  CSSProperties
> = {
  container: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    height: '100%',
    overflowY: 'auto',
  },
  groupContainer: {
    padding: '5px',
    borderRadius: '5px',
    margin: '10px 0px',
    backgroundColor: 'white',
  },
  row: {
    display: 'flex',
    margin: '5px 0px',
  },
  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
  inputLabel: {
    flex: 2,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  input: {
    width: '30%',
    textAlign: 'center',
  },
};

const formatFields: Array<{
  id: number;
  label: string;
  checkController: string;
  formatController: string;
}> = [
  {
    id: 1,
    label: 'Peak Number :',
    checkController: 'peakNumber.show',
    formatController: 'peakNumber.format',
  },
  {
    id: 2,
    label: 'δ (ppm) :',
    checkController: 'deltaPPM.show',
    formatController: 'deltaPPM.format',
  },
  {
    id: 3,
    label: 'δ (Hz) :',
    checkController: 'deltaHz.show',
    formatController: 'deltaHz.format',
  },
  {
    id: 4,
    label: 'Peak Width (Hz)',
    checkController: 'peakWidth.show',
    formatController: 'peakWidth.format',
  },
  {
    id: 5,
    label: 'Intensity :',
    checkController: 'intensity.show',
    formatController: 'intensity.format',
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
    <div style={styles.container}>
      <FormikForm onSubmit={saveHandler} ref={formRef}>
        {nuclei?.map((n) => (
          <NucleusPreferences key={n} nucleus={n} />
        ))}
      </FormikForm>
    </div>
  );
}

const NucleusPreferences = ({ nucleus }: { nucleus: string }) => {
  return (
    <div style={styles.groupContainer}>
      <IsotopesViewer style={styles.header} value={nucleus} />
      {formatFields.map((field) => (
        <FormikColumnFormatField
          key={field.id}
          label={field.label}
          checkControllerName={`${nucleus}.${field.checkController}`}
          formatControllerName={`${nucleus}.${field.formatController}`}
        />
      ))}
    </div>
  );
};

export default memo(forwardRef(PeaksPreferences));
