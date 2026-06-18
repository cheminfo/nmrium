import { forwardRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext.js';
import { fieldLabelStyle } from '../../elements/FormatField.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import useNucleus from '../../hooks/useNucleus.js';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences.js';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei.js';
import type { NucleusPreferenceField } from '../extra/preferences/NucleusPreferences.js';
import { NucleusPreferences } from '../extra/preferences/NucleusPreferences.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number :',
    checkFieldName: 'tablePreferences.showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'Assignment label :',
    checkFieldName: 'tablePreferences.showAssignmentLabel',
    hideFormatField: true,
  },
  {
    id: 3,
    label: 'From (ppm) :',
    checkFieldName: 'tablePreferences.from.show',
    formatFieldName: 'tablePreferences.from.format',
  },
  {
    id: 4,
    label: 'To (ppm) :',
    checkFieldName: 'tablePreferences.to.show',
    formatFieldName: 'tablePreferences.to.format',
  },
  {
    id: 5,
    label: 'Absolute integration :',
    checkFieldName: 'tablePreferences.absolute.show',
    formatFieldName: 'tablePreferences.absolute.format',
  },
  {
    id: 6,
    label: 'Relative integration :',
    checkFieldName: 'tablePreferences.relative.show',
    formatFieldName: 'tablePreferences.relative.format',
  },
  {
    id: 7,
    label: 'δ (ppm) :',
    checkFieldName: 'tablePreferences.deltaPPM.show',
    formatFieldName: 'tablePreferences.deltaPPM.format',
  },
  {
    id: 8,
    label: 'δ (Hz) :',
    checkFieldName: 'tablePreferences.deltaHz.show',
    formatFieldName: 'tablePreferences.deltaHz.format',
  },
  {
    id: 9,
    label: 'Coupling (Hz) :',
    checkFieldName: 'tablePreferences.coupling.show',
    formatFieldName: 'tablePreferences.coupling.format',
  },
  {
    id: 10,
    label: 'Kind :',
    checkFieldName: 'tablePreferences.showKind',
    hideFormatField: true,
  },
  {
    id: 11,
    label: 'Multiplicity :',
    checkFieldName: 'tablePreferences.showMultiplicity',
    hideFormatField: true,
  },
  {
    id: 12,
    label: 'Assignment links :',
    checkFieldName: 'tablePreferences.showAssignment',
    hideFormatField: true,
  },
  {
    id: 13,
    label: 'Delete action :',
    checkFieldName: 'tablePreferences.showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 14,
    label: 'Zoom action :',
    checkFieldName: 'tablePreferences.showZoomAction',
    hideFormatField: true,
  },
  {
    id: 15,
    label: 'Edit action :',
    checkFieldName: 'tablePreferences.showEditAction',
    hideFormatField: true,
  },
];

export default forwardRef<SettingsRef | null>(
  function RangesPreferences(_, ref) {
    const preferences = usePreferences();
    const nucleus = useNucleus();
    const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
    const preferencesByNuclei = usePanelPreferencesByNuclei('ranges', nuclei);

    function saveHandler(values: any) {
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
  },
);
