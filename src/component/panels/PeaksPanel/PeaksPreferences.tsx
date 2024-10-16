import { forwardRef, memo, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext.js';
import useNucleus from '../../hooks/useNucleus.js';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences.js';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei.js';
import {
  NucleusPreferenceField,
  NucleusPreferences,
} from '../extra/preferences/NucleusPreferences.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number :',
    checkFieldName: 'showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'δ (ppm) :',
    checkFieldName: 'deltaPPM.show',
    formatFieldName: 'deltaPPM.format',
  },
  {
    id: 3,
    label: 'δ (Hz) :',
    checkFieldName: 'deltaHz.show',
    formatFieldName: 'deltaHz.format',
  },
  {
    id: 4,
    label: 'Peak Width (Hz)',
    checkFieldName: 'peakWidth.show',
    formatFieldName: 'peakWidth.format',
  },
  {
    id: 5,
    label: 'Intensity :',
    checkFieldName: 'intensity.show',
    formatFieldName: 'intensity.format',
  },
  {
    id: 6,
    label: 'kind :',
    checkFieldName: 'fwhm.show',
  },
  {
    id: 7,
    label: 'fwhm :',
    checkFieldName: 'fwhm.show',
    formatFieldName: 'fwhm.format',
  },
  {
    id: 8,
    label: 'mu :',
    checkFieldName: 'mu.show',
    formatFieldName: 'mu.format',
  },
  {
    id: 9,
    label: 'Delete action :',
    checkFieldName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 10,
    label: 'Edit peak shape action :',
    checkFieldName: 'showEditPeakShapeAction',
    hideFormatField: true,
  },
];

function PeaksPreferences(props, ref: any) {
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

  const { handleSubmit, control } = useForm<any>({
    defaultValues: preferencesByNuclei,
  });

  useSettingImperativeHandle(ref, handleSubmit, saveHandler);

  return (
    <PreferencesContainer>
      {nuclei?.map((n) => (
        <NucleusPreferences
          control={control}
          key={n}
          nucleus={n}
          fields={formatFields}
        />
      ))}
    </PreferencesContainer>
  );
}

export default memo(forwardRef(PeaksPreferences));
