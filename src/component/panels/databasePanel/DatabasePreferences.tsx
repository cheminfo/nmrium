import { Formik } from 'formik';
import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import Label from '../../elements/Label';
import FormikColorInput from '../../elements/formik/FormikColorInput';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikInput from '../../elements/formik/FormikInput';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import { PreferencesGroup } from '../extra/preferences/PreferencesGroup';

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
    <PreferencesContainer>
      <Formik initialValues={{}} onSubmit={saveHandler} innerRef={formRef}>
        <PreferencesGroup>
          <FormikColumnFormatField
            label="Preview jcamp"
            checkControllerName="previewJcamp"
            hideFormatField
          />
          <FormikColorInput name="color" />
          <Label
            title="Margin bottom (px) :"
            style={{ label: { padding: 0, flex: 4 }, wrapper: { flex: 8 } }}
          >
            <FormikInput name="marginBottom" type="number" />
          </Label>
        </PreferencesGroup>
        <PreferencesGroup header="Table Preferences">
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
            checkControllerName="range.show"
            formatControllerName="range.format"
          />
          <FormikColumnFormatField
            label="δ (ppm)"
            checkControllerName="delta.show"
            formatControllerName="delta.format"
          />
          <FormikColumnFormatField
            label="Assignment"
            checkControllerName="showAssignment"
            hideFormatField
          />
          <FormikColumnFormatField
            label="J (Hz)"
            checkControllerName="coupling.show"
            formatControllerName="coupling.format"
          />
          <FormikColumnFormatField
            label="Multiplicity"
            checkControllerName="showMultiplicity"
            hideFormatField
          />
        </PreferencesGroup>
      </Formik>
    </PreferencesContainer>
  );
}

export default forwardRef(DatabasePreferences);
