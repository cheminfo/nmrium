import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  CSSProperties,
  forwardRef,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { useAlert } from '../../elements/popup/Alert';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import {
  useStateWithLocalStorage,
  getValue as getValueByKeyPath,
} from '../../utility/LocalStorage';
import { databaseDefaultValues } from '../extra/preferences/defaultValues';

const styles: Record<
  | 'container'
  | 'groupContainer'
  | 'header'
  | 'inputContainer'
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

  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
  inputContainer: {
    flex: 4,
    borderRadius: '5px',
  },
  inputLabel: {
    flex: 2,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  input: {
    width: '100px',
  },
};

function DatabasePreferences(props, ref) {
  const preferences = usePreferences();
  const alert = useAlert();
  const [, setSettingsData] = useStateWithLocalStorage('nmr-general-settings');

  const formRef = useRef<any>();

  const updateValues = useCallback(() => {
    const databasePreferences = getValueByKeyPath(
      preferences,
      `formatting.panels.database`,
    );

    formRef.current.setValues(
      databasePreferences ? databasePreferences : databaseDefaultValues,
    );
  }, [preferences]);

  useEffect(() => {
    updateValues();
  }, [updateValues]);

  const saveToLocalStorage = (values) => {
    setSettingsData(values, 'formatting.panels.database');
  };

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      preferences.dispatch({
        type: SET_PANELS_PREFERENCES,
        payload: { key: 'database', value: values },
      });
      if (showMessage) {
        alert.success('database preferences saved successfully');
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
    saveToLocalStorage(values);
  };

  return (
    <div style={styles.container}>
      <FormikForm onSubmit={handleSubmit} ref={formRef}>
        <div style={styles.groupContainer}>
          <FormikColumnFormatField
            label="Smiles"
            checkControllerName="showSmiles"
            hideFormat
          />
          <FormikColumnFormatField
            label="Solvent"
            checkControllerName="showSolvent"
            hideFormat
          />
          <FormikColumnFormatField
            label="Names"
            checkControllerName="showNames"
            hideFormat
          />
          <FormikColumnFormatField
            label="Range"
            checkControllerName="showRange"
            hideFormat
          />
          <FormikColumnFormatField
            label="δ (ppm)"
            checkControllerName="showDelta"
            hideFormat
          />
          <FormikColumnFormatField
            label="Assignment"
            checkControllerName="showAssignment"
            hideFormat
          />
          <FormikColumnFormatField
            label="J (Hz)"
            checkControllerName="showCoupling"
            hideFormat
          />
          <FormikColumnFormatField
            label="Multiplicity"
            checkControllerName="showMultiplicity"
            hideFormat
          />

          <FormikInput
            name="rowHeight"
            label="Row Height (px) :"
            type="number"
            style={{
              inputContainer: styles.inputContainer,
              label: styles.inputLabel,
              input: styles.input,
            }}
          />
        </div>
      </FormikForm>
    </div>
  );
}

export default forwardRef(DatabasePreferences);
