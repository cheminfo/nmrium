import { Button, Tag } from '@blueprintjs/core';
import { ExportPreferences, UniversalExportSettings } from 'nmr-load-save';
import { useFormContext, useWatch } from 'react-hook-form';

import { CheckController } from '../../../elements/CheckController';
import { GroupPane } from '../../../elements/GroupPane';
import Label from '../../../elements/Label';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import { Select2Controller } from '../../../elements/Select2Controller';
import { units } from '../../../elements/export/units';
import { useExportConfigurer } from '../../../elements/export/useExportConfigurer';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';
import { labelStyle } from '../../SaveAsModal';

const INITIAL_VALUE: UniversalExportSettings = {
  unit: 'px',
  width: 400,
  height: 400,
  dpi: 72,
  useDefaultSettings: false,
};

export function ExportTabContent() {
  return (
    <>
      <GroupPane text="Png export options">
        <ExportOptions exportAs="png" />
      </GroupPane>
      <GroupPane text="Svg export options">
        <ExportOptions exportAs="svg" />
      </GroupPane>
      <GroupPane text="Clipboard export options">
        <ExportOptions exportAs="clipboard" />
      </GroupPane>
    </>
  );
}

interface ExportOptionsProps {
  exportAs: keyof ExportPreferences;
}

export function ExportOptions(props: ExportOptionsProps) {
  const { exportAs } = props;
  const path: `export.${keyof ExportPreferences}` = `export.${exportAs}`;
  const { setValue, control } = useFormContext<WorkspaceWithSource>();
  const currentOptions = useWatch({
    name: path,
    defaultValue: INITIAL_VALUE,
  });

  const { unit } = currentOptions;

  const {
    widthInPixel,
    heightInPixel,
    isAspectRatioEnabled,
    changeDPI,
    enableAspectRatio,
    changeSize,
    changeUnit,
  } = useExportConfigurer(currentOptions);

  return (
    <>
      <Label style={labelStyle} title="Description:">
        <Tag>{`${widthInPixel} px x ${heightInPixel} px @ ${unit}DPI`}</Tag>
      </Label>
      <Label style={labelStyle} title="Size">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <NumberInput2Controller
            name={`${path}.width`}
            control={control}
            style={{ width: 100 }}
            rightElement={<Tag>{unit}</Tag>}
            controllerProps={{ rules: { required: true } }}
            transformValue={(value) => {
              const newHeight = changeSize(value, 'height', 'width');
              setValue(`${path}.height`, newHeight);
              return value;
            }}
            debounceTime={250}
            placeholder="width"
          />
          <div style={{ padding: '0px 5px' }}>
            <Button
              icon="link"
              minimal
              active={isAspectRatioEnabled}
              onClick={() => {
                enableAspectRatio((prevFlag) => !prevFlag);
              }}
            />
          </div>
          <NumberInput2Controller
            name={`${path}.height`}
            control={control}
            style={{ width: 100 }}
            rightElement={<Tag>{unit}</Tag>}
            controllerProps={{ rules: { required: true } }}
            transformValue={(value) => {
              const newWidth = changeSize(value, 'width', 'height');
              setValue(`${path}.width`, newWidth);
              return value;
            }}
            debounceTime={250}
            placeholder="height"
          />
        </div>
      </Label>
      <Label style={labelStyle} title="Units">
        <Select2Controller
          control={control}
          name={`${path}.unit`}
          itemTextKey="name"
          itemValueKey="unit"
          items={units}
          onItemSelect={({ unit }) => {
            const newSize = changeUnit({ unit });
            setValue(`${path}.width`, newSize.width);
            setValue(`${path}.height`, newSize.height);
          }}
        />
      </Label>
      <Label style={labelStyle} title="DPI">
        <NumberInput2Controller
          name={`${path}.dpi`}
          control={control}
          style={{ width: 100 }}
          controllerProps={{ rules: { required: true } }}
          transformValue={(value) => {
            if (unit === 'px') {
              const convertedValue = changeDPI(value);
              setValue(`${path}.width`, convertedValue.width);
              setValue(`${path}.height`, convertedValue.height);
            }

            return value;
          }}
          debounceTime={250}
          placeholder="DPI"
        />
      </Label>
      <CheckController
        control={control}
        name={`${path}.useDefaultSettings`}
        label="Don't show the options dialog during export and use current settings"
      />
    </>
  );
}
