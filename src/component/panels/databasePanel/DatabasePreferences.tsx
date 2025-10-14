import { Tag } from '@blueprintjs/core';
import { forwardRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext.js';
import { ColorPickerDropdownController } from '../../elements/ColorPickerDropdownController.js';
import { FormatField, fieldLabelStyle } from '../../elements/FormatField.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import { PreferencesGroup } from '../extra/preferences/PreferencesGroup.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

function DatabasePreferences(props: any, ref: any) {
  const preferences = usePreferences();
  const databasePreferences = usePanelPreferences('database');

  const saveHandler = useCallback(
    (values: any) => {
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
        <Label title="Structure min width:" style={fieldLabelStyle}>
          <NumberInput2Controller
            control={control}
            name="structureSize.minWidth"
            min={0}
            controllerProps={{ rules: { min: 0, required: true } }}
            rightElement={<Tag>px</Tag>}
          />
        </Label>
        <Label title="Structure min height:" style={fieldLabelStyle}>
          <NumberInput2Controller
            control={control}
            name="structureSize.minHeight"
            min={0}
            controllerProps={{ rules: { min: 0, required: true } }}
            rightElement={<Tag>px</Tag>}
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
