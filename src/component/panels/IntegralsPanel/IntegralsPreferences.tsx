import { useCallback, memo, forwardRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext';
import { ColorPickerDropdownController } from '../../elements/ColorPickerDropdownController';
import { fieldLabelStyle } from '../../elements/FormatField';
import Label from '../../elements/Label';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei';
import {
  NucleusPreferenceField,
  NucleusPreferences,
} from '../extra/preferences/NucleusPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import {
  SettingsRef,
  useSettingImperativeHandle,
} from '../extra/utilities/settingImperativeHandle';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number :',
    checkFieldName: 'showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'Absolute :',
    checkFieldName: 'absolute.show',
    formatFieldName: 'absolute.format',
  },
  {
    id: 3,
    label: 'Relative :',
    checkFieldName: 'relative.show',
    formatFieldName: 'relative.format',
  },
  {
    id: 4,
    label: 'from :',
    checkFieldName: 'from.show',
    formatFieldName: 'from.format',
  },
  {
    id: 5,
    label: 'to :',
    checkFieldName: 'to.show',
    formatFieldName: 'to.format',
  },
  {
    id: 6,
    label: 'Kind :',
    checkFieldName: 'showKind',
    hideFormatField: true,
  },
  {
    id: 7,
    label: 'Delete action :',
    checkFieldName: 'showDeleteAction',
    hideFormatField: true,
  },
];

function IntegralsPreferences(props, ref) {
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('integrals', nuclei);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'integrals', value: values },
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
          key={n}
          control={control}
          nucleus={n}
          fields={formatFields}
          renderTop={() => (
            <>
              <Label title="Color" style={fieldLabelStyle}>
                <div style={{ display: 'flex', padding: '2px 0' }}>
                  <div style={{ width: '23px' }} />
                  <ColorPickerDropdownController
                    control={control}
                    name={`nuclei.${n}.color`}
                  />
                </div>
              </Label>
              <Label title="Stroke width:" style={fieldLabelStyle}>
                <div style={{ display: 'flex', padding: '2px 0' }}>
                  <div style={{ width: '23px' }} />
                  <NumberInput2Controller
                    name={`nuclei.${n}.strokeWidth`}
                    control={control}
                    min={1}
                    max={9}
                    controllerProps={{
                      rules: { min: 1, max: 9, required: true },
                    }}
                  />
                </div>
              </Label>
            </>
          )}
        />
      ))}
    </PreferencesContainer>
  );
}

export default memo(forwardRef<SettingsRef>(IntegralsPreferences));
