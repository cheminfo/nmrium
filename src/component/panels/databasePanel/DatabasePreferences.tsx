import { useEffect, useCallback, forwardRef } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext';
import { ColorPickerDropdownController } from '../../elements/ColorPickerDropdownController';
import { FormatField, fieldLabelStyle } from '../../elements/FormatField';
import Label from '../../elements/Label';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import { PreferencesGroup } from '../extra/preferences/PreferencesGroup';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle';

function DatabasePreferences(props, ref) {
  const preferences = usePreferences();
  const databasePreferences = usePanelPreferences('database');

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'database', value: values },
      });
    },
    [preferences],
  );

  const { handleSubmit, reset, control } = useForm<any>({
    defaultValues: databasePreferences,
  });

  useEffect(() => {
    reset(databasePreferences);
  }, [databasePreferences, reset]);

  useSettingImperativeHandle(ref, handleSubmit, saveHandler);

  return (
    <PreferencesContainer>
      <PreferencesGroup>
        <FormatField
          control={control}
          label="Preview jcamp"
          checkFieldName="previewJcamp"
          hideFormatField
        />
        <Label title="Color" style={fieldLabelStyle}>
          <ColorPickerDropdownController control={control} name="color" />
        </Label>
        <Label title="Margin bottom (px):" style={fieldLabelStyle}>
          <NumberInput2Controller
            control={control}
            name="marginBottom"
            min={0}
            controllerProps={{ rules: { min: 0, required: true } }}
          />
        </Label>
      </PreferencesGroup>
      <PreferencesGroup header="Table Preferences">
        <FormatField
          control={control}
          label="Structure"
          checkFieldName="showSmiles"
          hideFormatField
        />
        <FormatField
          control={control}
          label="Solvent"
          checkFieldName="showSolvent"
          hideFormatField
        />
        <FormatField
          control={control}
          label="Names"
          checkFieldName="showNames"
          hideFormatField
        />
        <FormatField
          control={control}
          label="Range"
          checkFieldName="range.show"
          formatFieldName="range.format"
        />
        <FormatField
          control={control}
          label="δ (ppm)"
          checkFieldName="delta.show"
          formatFieldName="delta.format"
        />
        <FormatField
          control={control}
          label="Assignment"
          checkFieldName="showAssignment"
          hideFormatField
        />
        <FormatField
          control={control}
          label="J (Hz)"
          checkFieldName="coupling.show"
          formatFieldName="coupling.format"
        />
        <FormatField
          control={control}
          label="Multiplicity"
          checkFieldName="showMultiplicity"
          hideFormatField
        />
        <FormatField
          control={control}
          label="Save as nmrium"
          checkFieldName="allowSaveAsNMRium"
          hideFormatField
        />
      </PreferencesGroup>
    </PreferencesContainer>
  );
}

export default forwardRef(DatabasePreferences);
