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
import Label from '../../elements/Label';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import {
  NucleusPreferenceField,
  NucleusPreferences,
} from '../extra/preferences/NucleusPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

const styles: Record<'inputLabel' | 'inputWrapper', CSSProperties> = {
  inputLabel: {
    flex: 2,
  },
  inputWrapper: {
    width: '100px',
    flex: '4',
    borderRadius: '5px',
  },
};

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'From (ppm) :',
    checkControllerName: 'from.show',
    formatControllerName: 'from.format',
  },
  {
    id: 2,
    label: 'To (ppm) :',
    checkControllerName: 'to.show',
    formatControllerName: 'to.format',
  },
  {
    id: 3,
    label: 'Absolute integration :',
    checkControllerName: 'absolute.show',
    formatControllerName: 'absolute.format',
  },
  {
    id: 4,
    label: 'Relative integration :',
    checkControllerName: 'relative.show',
    formatControllerName: 'relative.format',
  },
  {
    id: 5,
    label: 'δ (ppm) :',
    checkControllerName: 'deltaPPM.show',
    formatControllerName: 'deltaPPM.format',
  },
  {
    id: 6,
    label: 'δ (Hz) :',
    checkControllerName: 'deltaHz.show',
    formatControllerName: 'deltaHz.format',
  },
  {
    id: 7,
    label: 'Coupling (Hz) :',
    checkControllerName: 'coupling.show',
    formatControllerName: 'coupling.format',
  },
  {
    id: 8,
    label: 'Kind :',
    checkControllerName: 'showKind',
    hideFormatField: true,
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
    <PreferencesContainer>
      <FormikForm onSubmit={saveHandler} ref={formRef}>
        {nuclei?.map((n) => (
          <NucleusPreferences
            key={n}
            nucleus={n}
            fields={formatFields}
            renderBottom={() => (
              <Label
                title="J Graph tolerance (Hz) :"
                style={{
                  label: styles.inputLabel,
                  wrapper: styles.inputWrapper,
                }}
              >
                <FormikInput
                  name={`nuclei.${n}.jGraphTolerance`}
                  type="number"
                />
              </Label>
            )}
          />
        ))}
      </FormikForm>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(RangesPreferences));
