import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  memo,
  CSSProperties,
  forwardRef,
  useMemo,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import Label from '../../elements/Label';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';

const styles: Record<
  | 'container'
  | 'groupContainer'
  | 'row'
  | 'header'
  | 'inputLabel'
  | 'inputWrapper',
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
  },

  inputWrapper: {
    width: '100px',
    flex: '4',
    borderRadius: '5px',
  },
};

const formatFields = [
  {
    id: 1,
    label: 'From (ppm) :',
    checkController: 'from.show',
    formatController: 'from.format',
  },
  {
    id: 2,
    label: 'To (ppm) :',
    checkController: 'to.show',
    formatController: 'to.format',
  },
  {
    id: 3,
    label: 'Absolute integration :',
    checkController: 'absolute.show',
    formatController: 'absolute.format',
  },
  {
    id: 4,
    label: 'Relative integration :',
    checkController: 'relative.show',
    formatController: 'relative.format',
  },
  {
    id: 5,
    label: 'δ (ppm) :',
    checkController: 'deltaPPM.show',
    formatController: 'deltaPPM.format',
  },
  {
    id: 6,
    label: 'δ (Hz) :',
    checkController: 'deltaHz.show',
    formatController: 'deltaHz.format',
  },
  {
    id: 7,
    label: 'Coupling (Hz) :',
    checkController: 'coupling.show',
    formatController: 'coupling.format',
  },
];

function RangesPreferences(props, ref) {
  const alert = useAlert();
  const formRef = useRef<any>();
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('ranges', nuclei);

  useEffect(() => {
    formRef.current.setValues(preferencesByNuclei);
  }, [preferencesByNuclei]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'ranges', value: values },
      });
      alert.success('ranges preferences saved successfully');
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
    <div key={nucleus} style={styles.groupContainer}>
      <IsotopesViewer style={styles.header} value={nucleus} />
      {formatFields.map((field) => (
        <FormikColumnFormatField
          key={field.id}
          label={field.label}
          checkControllerName={`${nucleus}.${field.checkController}`}
          formatControllerName={`${nucleus}.${field.formatController}`}
        />
      ))}
      <Label
        title="J Graph tolerance (Hz) :"
        style={{ label: styles.inputLabel, wrapper: styles.inputWrapper }}
      >
        <FormikInput name={`${nucleus}.jGraphTolerance`} type="number" />
      </Label>
    </div>
  );
};

export default memo(forwardRef(RangesPreferences));
