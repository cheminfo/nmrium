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
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import {
  NucleusPreferences,
  NucleusPreferenceField,
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
    label: 'δ (ppm) :',
    checkControllerName: 'deltaPPM.show',
    formatControllerName: 'deltaPPM.format',
  },
  {
    id: 3,
    label: 'δ (Hz) :',
    checkControllerName: 'deltaHz.show',
    formatControllerName: 'deltaHz.format',
  },
  {
    id: 4,
    label: 'Peak Width (Hz)',
    checkControllerName: 'peakWidth.show',
    formatControllerName: 'peakWidth.format',
  },
  {
    id: 5,
    label: 'Intensity :',
    checkControllerName: 'intensity.show',
    formatControllerName: 'intensity.format',
  },
  {
    id: 6,
    label: 'kind :',
    checkControllerName: 'fwhm.show',
  },
  {
    id: 7,
    label: 'fwhm :',
    checkControllerName: 'fwhm.show',
    formatControllerName: 'fwhm.format',
  },
  {
    id: 8,
    label: 'mu :',
    checkControllerName: 'mu.show',
    formatControllerName: 'mu.format',
  },
  {
    id: 9,
    label: 'Delete action :',
    checkControllerName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 10,
    label: 'Edit peak shape action :',
    checkControllerName: 'showEditPeakShapeAction',
    hideFormatField: true,
  },
];

function PeaksPreferences(props, ref: any) {
  const formRef = useRef<any>(null);
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('peaks', nuclei);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'peaks', value: values },
      });
    },
    [preferences],
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
      <Formik
        initialValues={preferencesByNuclei}
        onSubmit={saveHandler}
        innerRef={formRef}
      >
        <>
          {nuclei?.map((n) => (
            <NucleusPreferences key={n} nucleus={n} fields={formatFields} />
          ))}
        </>
      </Formik>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(PeaksPreferences));
