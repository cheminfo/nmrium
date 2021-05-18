import {
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { MF } from 'react-mf';

import FormikColorInput from '../../elements/formik/FormikColorInput';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import { useAlert } from '../../elements/popup/Alert';
import IntegralsWrapper from '../../hoc/IntegralsWrapper';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import {
  useStateWithLocalStorage,
  getValue as getValueByKeyPath,
} from '../../utility/LocalStorage';
import { integralDefaultValues } from '../extra/preferences/defaultValues';

const styles = {
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
    checkController: 'showAbsolute',
    formatController: 'absoluteFormat',
  },
  {
    id: 2,
    label: 'Relative :',
    checkController: 'showRelative',
    formatController: 'relativeFormat',
  },
];
function IntegralsPreferences({ nucleus, preferences }, ref) {
  const alert = useAlert();
  const [, setSettingsData] = useStateWithLocalStorage('nmr-general-settings');

  const formRef = useRef();

  const updateValues = useCallback(() => {
    if (nucleus) {
      const { color, strokeWidth, ...restProps } = integralDefaultValues;

      const integralPreferences = getValueByKeyPath(
        preferences,
        `formatting.panels.integrals`,
      );

      let defaultValues = nucleus.reduce((acc, nucleusLabel) => {
        acc[nucleusLabel] = restProps;
        return acc;
      }, {});
      defaultValues = Object.assign(defaultValues, { color, strokeWidth });

      formRef.current.setValues(
        integralPreferences ? integralPreferences : defaultValues,
      );
    }
  }, [nucleus, preferences]);

  useEffect(() => {
    updateValues();
  }, [updateValues]);

  const saveToLocalStorgate = (values) => {
    setSettingsData(values, 'formatting.panels.integrals');
  };

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      preferences.dispatch({
        type: SET_PANELS_PREFERENCES,
        payload: { key: 'integrals', value: values },
      });
      if (showMessage) {
        alert.success('Integrals preferences saved successfully');
      }
    },
    [alert, preferences],
  );

  useImperativeHandle(ref, () => ({
    saveSetting: () => {
      formRef.current.submitForm();
    },
    cancelSetting: () => {
      updateValues();
    },
  }));

  const handleSubmit = (values) => {
    saveHandler(values, true);
    saveToLocalStorgate(values);
  };

  return (
    <div style={styles.container}>
      <FormikForm onSubmit={handleSubmit} ref={formRef}>
        <div style={styles.groupContainer}>
          <p style={styles.header}>General</p>
          <FormikColorInput name="color" />
          <FormikNumberInput
            name="strokeWidth"
            label="stroke width :"
            style={{
              label: { fontSize: '11px', fontWeight: 'bold', color: '#232323' },
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
        </div>

        {nucleus &&
          nucleus.map((nucleusLabel) => (
            <div key={nucleusLabel} style={styles.groupContainer}>
              <p style={styles.header}>
                <MF mf={nucleusLabel} />
              </p>
              {formatFields.map((field) => (
                <FormikColumnFormatField
                  key={field.id}
                  label={field.label}
                  checkControllerName={`${nucleusLabel}.${field.checkController}`}
                  formatControllerName={`${nucleusLabel}.${field.formatController}`}
                />
              ))}
            </div>
          ))}
      </FormikForm>
    </div>
  );
}

export default IntegralsWrapper(forwardRef(IntegralsPreferences));
