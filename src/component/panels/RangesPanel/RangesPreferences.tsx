import { Formik } from 'formik';
import { useImperativeHandle, useRef, forwardRef, useMemo } from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import Label from '../../elements/Label';
import {
  formatFieldInputStyle,
  formatFieldLabelStyle,
} from '../../elements/formik/FormikColumnFormatField';
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
    label: 'From (ppm) :',
    checkControllerName: 'from.show',
    formatControllerName: 'from.format',
  },
  {
    id: 3,
    label: 'To (ppm) :',
    checkControllerName: 'to.show',
    formatControllerName: 'to.format',
  },
  {
    id: 4,
    label: 'Absolute integration :',
    checkControllerName: 'absolute.show',
    formatControllerName: 'absolute.format',
  },
  {
    id: 5,
    label: 'Relative integration :',
    checkControllerName: 'relative.show',
    formatControllerName: 'relative.format',
  },
  {
    id: 6,
    label: 'δ (ppm) :',
    checkControllerName: 'deltaPPM.show',
    formatControllerName: 'deltaPPM.format',
  },
  {
    id: 7,
    label: 'δ (Hz) :',
    checkControllerName: 'deltaHz.show',
    formatControllerName: 'deltaHz.format',
  },
  {
    id: 8,
    label: 'Coupling (Hz) :',
    checkControllerName: 'coupling.show',
    formatControllerName: 'coupling.format',
  },
  {
    id: 9,
    label: 'Kind :',
    checkControllerName: 'showKind',
    hideFormatField: true,
  },
  {
    id: 10,
    label: 'Multiplicity :',
    checkControllerName: 'showMultiplicity',
    hideFormatField: true,
  },
  {
    id: 11,
    label: 'Assignment :',
    checkControllerName: 'showAssignment',
    hideFormatField: true,
  },
  {
    id: 12,
    label: 'Delete action :',
    checkControllerName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 13,
    label: 'Zoom action :',
    checkControllerName: 'showZoomAction',
    hideFormatField: true,
  },
  {
    id: 14,
    label: 'Edit action :',
    checkControllerName: 'showEditAction',
    hideFormatField: true,
  },
];

function RangesPreferences(props, ref) {
  const formRef = useRef<any>();
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('ranges', nuclei);

  function saveHandler(values) {
    preferences.dispatch({
      type: 'SET_PANELS_PREFERENCES',
      payload: { key: 'ranges', value: values },
    });
  }

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
      <Formik
        initialValues={preferencesByNuclei}
        enableReinitialize
        onSubmit={saveHandler}
        innerRef={formRef}
      >
        <>
          {nuclei?.map((n) => (
            <NucleusPreferences
              key={n}
              nucleus={n}
              fields={formatFields}
              renderBottom={() => (
                <Label
                  title="J Graph tolerance (Hz) :"
                  style={formatFieldLabelStyle}
                >
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '23px' }} />
                    <FormikInput
                      name={`nuclei.${n}.jGraphTolerance`}
                      type="number"
                      style={formatFieldInputStyle}
                    />
                  </div>
                </Label>
              )}
            />
          ))}
        </>
      </Formik>
    </PreferencesContainer>
  );
}

export default forwardRef(RangesPreferences);
