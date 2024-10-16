import { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext.js';
import useNucleus from '../../hooks/useNucleus.js';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences.js';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei.js';
import { is2DNucleus } from '../../utility/nucleusToString.js';
import type { NucleusPreferenceField } from '../extra/preferences/NucleusPreferences.js';
import { NucleusPreferences } from '../extra/preferences/NucleusPreferences.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

const preferences1DFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'δ (ppm) :',
    checkFieldName: 'deltaPPM.show',
    formatFieldName: 'deltaPPM.format',
  },
];
const preferences2DFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number:',
    checkFieldName: 'showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'Assignment label:',
    checkFieldName: 'showAssignmentLabel',
    hideFormatField: true,
  },
  {
    id: 3,
    label: 'Kind:',
    checkFieldName: 'showKind',
    hideFormatField: true,
  },
  {
    id: 4,
    label: 'Assignment links:',
    checkFieldName: 'showAssignment',
    hideFormatField: true,
  },
  {
    id: 5,
    label: 'Delete action:',
    checkFieldName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 6,
    label: 'Zoom action:',
    checkFieldName: 'showZoomAction',
    hideFormatField: true,
  },
  {
    id: 7,
    label: 'Edit action :',
    checkFieldName: 'showEditAction',
    hideFormatField: true,
  },
];

function ZonesPreferences(props, ref) {
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei2D = nucleus.filter((n) => is2DNucleus(n));
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const zonesPreferences = usePanelPreferencesByNuclei('zones', [
    ...nuclei,
    ...nuclei2D,
  ]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'zones', value: values },
      });
    },
    [preferences],
  );

  const { handleSubmit, reset, control } = useForm<any>({
    defaultValues: {},
  });

  useSettingImperativeHandle(ref, handleSubmit, saveHandler);

  useEffect(() => {
    reset(zonesPreferences);
  }, [reset, zonesPreferences]);

  return (
    <PreferencesContainer>
      {nuclei?.map((n) => (
        <NucleusPreferences
          control={control}
          key={n}
          nucleus={n}
          fields={preferences1DFields}
        />
      ))}
      {nuclei2D?.map((n) => (
        <NucleusPreferences
          control={control}
          key={n}
          nucleus={n}
          fields={preferences2DFields}
        />
      ))}
    </PreferencesContainer>
  );
}

export default memo(forwardRef<SettingsRef>(ZonesPreferences));
