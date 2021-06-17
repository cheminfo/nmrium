import {
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

import IsotopesViewer from '../../elements/IsotopesViewer';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import { useAlert } from '../../elements/popup/Alert';
import PeaksWrapper from '../../hoc/PeaksWrapper';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import {
  useStateWithLocalStorage,
  getValue as getValueByKeyPath,
} from '../../utility/LocalStorage';
import { peaksDefaultValues } from '../extra/preferences/defaultValues';

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
    label: 'Peak Number :',
    checkController: 'showPeakNumber',
    formatController: 'peakNumberFormat',
  },
  {
    id: 2,
    label: 'Peak Index : ',
    checkController: 'showPeakIndex',
    formatController: 'peakIndexFormat',
  },
  {
    id: 3,
    label: 'δ (ppm) :',
    checkController: 'showDeltaPPM',
    formatController: 'deltaPPMFormat',
  },
  {
    id: 4,
    label: 'δ (Hz) :',
    checkController: 'showDeltaHz',
    formatController: 'deltaHzFormat',
  },
  {
    id: 5,
    label: 'Peak Width',
    checkController: 'showPeakWidth',
    formatController: 'peakWidthFormat',
  },
  {
    id: 6,
    label: 'Intensity :',
    checkController: 'showIntensity',
    formatController: 'intensityFormat',
  },
];

function PeaksPreferences({ nucleus, preferences }, ref) {
  const alert = useAlert();
  const [, setSettingsData] = useStateWithLocalStorage('nmr-general-settings');
  const formRef = useRef();

  const updateValues = useCallback(() => {
    if (nucleus) {
      const defaultValues = nucleus.reduce((acc, nucleusLabel) => {
        acc[nucleusLabel] = peaksDefaultValues;
        return acc;
      }, {});
      const peaksPreferences = getValueByKeyPath(
        preferences,
        `formatting.panels.peaks`,
      );
      formRef.current.setValues(
        peaksPreferences ? peaksPreferences : defaultValues,
      );
    }
  }, [nucleus, preferences]);

  useEffect(() => {
    updateValues();
  }, [updateValues]);

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      preferences.dispatch({
        type: SET_PANELS_PREFERENCES,
        payload: { key: 'peaks', value: values },
      });
      if (showMessage) alert.success('Peaks preferences saved successfully');
    },
    [alert, preferences],
  );

  useImperativeHandle(
    ref,
    () => ({
      saveSetting: () => {
        formRef.current.submitForm();
      },
      cancelSetting: () => {
        updateValues();
      },
    }),
    [updateValues],
  );

  const handleSubmit = useCallback(
    (values) => {
      saveHandler(values, true);
      setSettingsData(values, 'formatting.panels.peaks');
    },
    [saveHandler, setSettingsData],
  );

  return (
    <div style={styles.container}>
      <FormikForm onSubmit={handleSubmit} ref={formRef}>
        {nucleus &&
          nucleus.map((nucleusLabel) => (
            <div key={nucleusLabel} style={styles.groupContainer}>
              <IsotopesViewer style={styles.header} value={nucleusLabel} />
              {formatFields.map((field) => (
                <FormikColumnFormatField
                  key={field.id}
                  label={field.label}
                  checkControllerName={`${nucleusLabel}.${field.checkController}`}
                  formatControllerName={`${nucleusLabel}.${field.formatController}`}
                  hideFormat={field.formatController === 'deltaPPMFormat'}
                />
              ))}
            </div>
          ))}
      </FormikForm>
    </div>
  );
}

export default PeaksWrapper(forwardRef(PeaksPreferences));
