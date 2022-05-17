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
import { MF } from 'react-mf';

import { usePreferences } from '../../context/PreferencesContext';
import FormikColorInput from '../../elements/formik/FormikColorInput';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
// import { getValue as getValueByKeyPath } from '../../utility/LocalStorage';
// import { integralDefaultValues } from '../extra/preferences/defaultValues';

const styles: Record<
  | 'container'
  | 'groupContainer'
  | 'row'
  | 'header'
  | 'inputLabel'
  | 'input'
  | 'inputLabel',
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

const formatFields = [
  {
    id: 1,
    label: 'Absolute :',
    checkController: 'absolute.show',
    formatController: 'absolute.format',
  },
  {
    id: 2,
    label: 'Relative :',
    checkController: 'relative.show',
    formatController: 'relative.format',
  },
];

function IntegralsPreferences(props, ref) {
  const alert = useAlert();
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('integrals', nuclei);

  const formRef = useRef<any>();

  useEffect(() => {
    formRef.current.setValues(preferencesByNuclei);
  }, [preferencesByNuclei]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'integrals', value: values },
      });
      alert.success('Integrals preferences saved successfully');
    },
    [alert, preferences],
  );

  useImperativeHandle(ref, () => ({
    saveSetting: () => {
      formRef.current.submitForm();
    },
  }));

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
      <p style={styles.header}>
        <MF mf={nucleus} />
      </p>

      <FormikColorInput name={`nuclei.${nucleus}.color`} />
      <FormikNumberInput
        name={`nuclei.${nucleus}.strokeWidth`}
        label="stroke width :"
        style={{
          label: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#232323',
          },
          input: {
            width: '60%',
            textAlign: 'center',
            borderRadius: '5px',
          },
        }}
        min={1}
        max={9}
        pattern="[1-9]+"
      />
      {formatFields.map((field) => (
        <FormikColumnFormatField
          key={field.id}
          label={field.label}
          checkControllerName={`nuclei.${nucleus}.${field.checkController}`}
          formatControllerName={`nuclei.${nucleus}.${field.formatController}`}
        />
      ))}
    </div>
  );
};

export default memo(forwardRef(IntegralsPreferences));
