import { Formik } from 'formik';
import {
  useCallback,
  useImperativeHandle,
  useRef,
  memo,
  forwardRef,
  useMemo,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import Label from '../../elements/Label';
import FormikColorInput from '../../elements/formik/FormikColorInput';
import { formatFieldLabelStyle } from '../../elements/formik/FormikColumnFormatField';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import {
  NucleusPreferenceField,
  NucleusPreferences,
} from '../extra/preferences/NucleusPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import FormikInput from '../../elements/formik/FormikInput';

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
  {
    id: 3,
    label: 'Kind :',
    checkControllerName: 'showKind',
    hideFormatField: true,
  },
];

function IntegralsPreferences(props, ref) {
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('integrals', nuclei);

  const formRef = useRef<any>();

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'integrals', value: values },
      });
    },
    [preferences],
  );

  useImperativeHandle(ref, () => ({
    saveSetting: () => {
      formRef.current.submitForm();
    },
  }));

  return (
    <PreferencesContainer>
      <Formik
        initialValues={preferencesByNuclei}
        onSubmit={saveHandler}
        innerRef={formRef}
      >
        <>
          {nuclei?.map((n) => (
            <NucleusPreferences
              key={n}
              nucleus={n}
              fields={formatFields}
              renderTop={() => (
                <>
                  <Label title="Color" style={formatFieldLabelStyle}>
                    <div style={{ display: 'flex', padding: '2px 0' }}>
                      <div style={{ width: '23px' }} />
                      <FormikColorInput name={`nuclei.${n}.color`} />
                    </div>
                  </Label>
                  <Label title="stroke width :" style={formatFieldLabelStyle}>
                    <div style={{ display: 'flex', padding: '2px 0' }}>
                      <div style={{ width: '23px' }} />
                      <FormikInput
                        name={`nuclei.${n}.strokeWidth`}
                        type="number"
                        style={{
                          input: {
                            textAlign: 'center',
                            padding: '2px',
                          },
                          inputWrapper: {
                            width: '60%',
                          },
                        }}
                        min={1}
                        max={9}
                        pattern="[1-9]+"
                      />
                    </div>
                  </Label>
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
