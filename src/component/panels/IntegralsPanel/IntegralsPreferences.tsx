import { Formik } from 'formik';
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
import FormikColorInput from '../../elements/formik/FormikColorInput';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import {
  NucleusPreferenceField,
  NucleusPreferences,
} from '../extra/preferences/NucleusPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Absolute :',
    checkControllerName: 'absolute.show',
    formatControllerName: 'absolute.format',
  },
  {
    id: 2,
    label: 'Relative :',
    checkControllerName: 'relative.show',
    formatControllerName: 'relative.format',
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
    <PreferencesContainer>
      <Formik initialValues={{}} onSubmit={saveHandler} innerRef={formRef}>
        <>
          {nuclei?.map((n) => (
            <NucleusPreferences
              key={n}
              nucleus={n}
              fields={formatFields}
              renderTop={() => (
                <>
                  <FormikColorInput name={`nuclei.${n}.color`} />
                  <FormikNumberInput
                    name={`nuclei.${n}.strokeWidth`}
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
                </>
              )}
            />
          ))}
        </>
      </Formik>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(IntegralsPreferences));
