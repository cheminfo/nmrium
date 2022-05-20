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
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

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

  const formRef = useRef<any>();
  const databasePreferences = usePanelPreferences('database');

  useEffect(() => {
    formRef.current.setValues(databasePreferences);
  }, [databasePreferences]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'database', value: values },
      });
      alert.success('database preferences saved successfully');
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
        <div style={styles.groupContainer}>
          <FormikColumnFormatField
            label="Preview jcamp"
            checkControllerName="previewJcamp"
            hideFormatField
          />
          <FormikColumnFormatField
            label="Structure"
            checkControllerName="showSmiles"
            hideFormatField
          />
          <FormikColumnFormatField
            label="Solvent"
            checkControllerName="showSolvent"
            hideFormatField
          />
          <FormikColumnFormatField
            label="Names"
            checkControllerName="showNames"
            hideFormatField
          />
          <FormikColumnFormatField
            label="Range"
            checkControllerName="showRange"
            hideFormatField
          />
          <FormikColumnFormatField
            label="δ (ppm)"
            checkControllerName="showDelta"
            hideFormatField
          />
          <FormikColumnFormatField
            label="Assignment"
            checkControllerName="showAssignment"
            hideFormatField
          />
          <FormikColumnFormatField
            label="J (Hz)"
            checkControllerName="showCoupling"
            hideFormatField
          />
          <FormikColumnFormatField
            label="Multiplicity"
            checkControllerName="showMultiplicity"
            hideFormatField
          />
        </div>
      </FormikForm>
    </div>
  );
}

export default forwardRef(DatabasePreferences);
