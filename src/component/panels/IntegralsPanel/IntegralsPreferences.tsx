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
import FormikColorPickerDropdown from '../../elements/formik/FormikColorPickerDropdown';
import { formatFieldLabelStyle } from '../../elements/formik/FormikColumnFormatField';
import FormikInput from '../../elements/formik/FormikInput';
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
    label: 'Serial number :',
    checkControllerName: 'showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'Absolute :',
    checkControllerName: 'absolute.show',
    formatControllerName: 'absolute.format',
  },
  {
    id: 3,
    label: 'Relative :',
    checkControllerName: 'relative.show',
    formatControllerName: 'relative.format',
  },
  {
    id: 4,
    label: 'from :',
    checkControllerName: 'from.show',
    formatControllerName: 'from.format',
  },
  {
    id: 5,
    label: 'to :',
    checkControllerName: 'to.show',
    formatControllerName: 'to.format',
  },
  {
    id: 6,
    label: 'Kind :',
    checkControllerName: 'showKind',
    hideFormatField: true,
  },
  {
    id: 7,
    label: 'Delete action :',
    checkControllerName: 'showDeleteAction',
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
                      <FormikColorPickerDropdown name={`nuclei.${n}.color`} />
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
