import { Formik, FormikProps } from 'formik';
import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef,
  useMemo,
  memo,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import { is2DNucleus } from '../../utility/nucleusToString';
import {
  NucleusPreferences,
  NucleusPreferenceField,
} from '../extra/preferences/NucleusPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

const preferences1DFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'δ (ppm) :',
    checkControllerName: 'deltaPPM.show',
    formatControllerName: 'deltaPPM.format',
  },
];
const preferences2DFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number :',
    checkControllerName: 'showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'Kind :',
    checkControllerName: 'showKind',
    hideFormatField: true,
  },
  {
    id: 3,
    label: 'Assignment :',
    checkControllerName: 'showAssignment',
    hideFormatField: true,
  },
  {
    id: 4,
    label: 'Delete action :',
    checkControllerName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 5,
    label: 'Zoom action :',
    checkControllerName: 'showZoomAction',
    hideFormatField: true,
  },
  {
    id: 6,
    label: 'Edit action :',
    checkControllerName: 'showEditAction',
    hideFormatField: true,
  },
];

function ZonesPreferences(props, ref) {
  const formRef = useRef<FormikProps<any>>(null);

  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei2D = nucleus.filter((n) => is2DNucleus(n));
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const zonesPreferences = usePanelPreferencesByNuclei('zones', [
    ...nuclei,
    ...nuclei2D,
  ]);

  useEffect(() => {
    void formRef.current?.setValues(zonesPreferences);
  }, [zonesPreferences]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'zones', value: values },
      });
    },
    [preferences],
  );

  useImperativeHandle(
    ref,
    () => ({
      saveSetting: () => {
        void formRef.current?.submitForm();
      },
    }),
    [],
  );

  return (
    <PreferencesContainer>
      <Formik initialValues={{}} onSubmit={saveHandler} innerRef={formRef}>
        <>
          {nuclei?.map((n) => (
            <NucleusPreferences
              key={n}
              nucleus={n}
              fields={preferences1DFields}
            />
          ))}
          {nuclei2D?.map((n) => (
            <NucleusPreferences
              key={n}
              nucleus={n}
              fields={preferences2DFields}
            />
          ))}
        </>
      </Formik>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(ZonesPreferences));
