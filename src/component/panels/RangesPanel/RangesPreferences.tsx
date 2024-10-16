import { forwardRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext.js';
import { fieldLabelStyle } from '../../elements/FormatField.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
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
    label: 'Assignment label :',
    checkFieldName: 'showAssignmentLabel',
    hideFormatField: true,
  },
  {
    id: 3,
    label: 'From (ppm) :',
    checkFieldName: 'from.show',
    formatFieldName: 'from.format',
  },
  {
    id: 4,
    label: 'To (ppm) :',
    checkFieldName: 'to.show',
    formatFieldName: 'to.format',
  },
  {
    id: 5,
    label: 'Absolute integration :',
    checkFieldName: 'absolute.show',
    formatFieldName: 'absolute.format',
  },
  {
    id: 6,
    label: 'Relative integration :',
    checkFieldName: 'relative.show',
    formatFieldName: 'relative.format',
  },
  {
    id: 7,
    label: 'δ (ppm) :',
    checkFieldName: 'deltaPPM.show',
    formatFieldName: 'deltaPPM.format',
  },
  {
    id: 8,
    label: 'δ (Hz) :',
    checkFieldName: 'deltaHz.show',
    formatFieldName: 'deltaHz.format',
  },
  {
    id: 9,
    label: 'Coupling (Hz) :',
    checkFieldName: 'coupling.show',
    formatFieldName: 'coupling.format',
  },
  {
    id: 10,
    label: 'Kind :',
    checkFieldName: 'showKind',
    hideFormatField: true,
  },
  {
    id: 11,
    label: 'Multiplicity :',
    checkFieldName: 'showMultiplicity',
    hideFormatField: true,
  },
  {
    id: 12,
    label: 'Assignment links :',
    checkFieldName: 'showAssignment',
    hideFormatField: true,
  },
  {
    id: 13,
    label: 'Delete action :',
    checkFieldName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 14,
    label: 'Zoom action :',
    checkFieldName: 'showZoomAction',
    hideFormatField: true,
  },
  {
    id: 15,
    label: 'Edit action :',
    checkFieldName: 'showEditAction',
    hideFormatField: true,
  },
];

function RangesPreferences(props, ref) {
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

  const { handleSubmit, control, reset } = useForm<any>({
    defaultValues: preferencesByNuclei,
  });

  useSettingImperativeHandle(ref, handleSubmit, saveHandler);

  useEffect(() => {
    reset(preferencesByNuclei);
  }, [preferencesByNuclei, reset]);

  return (
    <PreferencesContainer>
      {nuclei?.map((n) => (
        <NucleusPreferences
          key={n}
          control={control}
          nucleus={n}
          fields={formatFields}
          renderBottom={() => (
            <Label title="J graph tolerance (Hz):" style={fieldLabelStyle}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '23px' }} />
                <NumberInput2Controller
                  control={control}
                  name={`nuclei.${n}.jGraphTolerance`}
                  min={0}
                  controllerProps={{ rules: { required: true, min: 0 } }}
                />
              </div>
            </Label>
          )}
        />
      ))}
    </PreferencesContainer>
  );
}

export default forwardRef(RangesPreferences);
