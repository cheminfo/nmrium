import { Button, Tag } from '@blueprintjs/core';
import { ExportPreferences, UniversalExportSettings } from 'nmr-load-save';
import { useDeferredValue, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CheckController } from '../../../elements/CheckController';
import { GroupPane } from '../../../elements/GroupPane';
import Label from '../../../elements/Label';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import { Select2Controller } from '../../../elements/Select2Controller';
import {
  convert,
  convertToPixels,
  units,
} from '../../../elements/export/units';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';
import { roundNumber } from '../../../utility/roundNumber';
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

  const [isAspectRatioEnabled, enableAspectRatio] = useState(true);

  const {
    unit: currentUnit,
    width: currentWidth,
    height: currentHeight,
    dpi: currentDPI,
  } = useWatch({
    name: path,
    defaultValue: INITIAL_VALUE,
  });

  const refSize = useRef({
    width: currentWidth,
    height: currentHeight,
    dpi: currentDPI,
  });

  const previousUnit = useDeferredValue(currentUnit);

  function transformSize(
    value: number,
    target: 'width' | 'height',
    source: 'width' | 'height',
  ) {
    if (isAspectRatioEnabled) {
      const { width, height } = refSize.current;
      const aspectRation = width / height;
      const newSize = value * aspectRation;
      refSize.current[target] = newSize;
      refSize.current[source] = value;
      setValue(`${path}.${target}`, newSize);
    } else {
      refSize.current[source] = value;
    }
    return value;
  }

  function transformResolution(value) {
    const { width, height, dpi } = refSize.current;
    if (currentUnit === 'px') {
      setValue(
        `${path}.width`,
        roundNumber((convertToPixels(width, currentUnit, 1) * value) / dpi, 2),
      );
      setValue(
        `${path}.height`,
        roundNumber((convertToPixels(height, currentUnit, 1) * value) / dpi, 2),
      );
    }

    return value;
  }

  function handleUnitChange({ unit }) {
    const w = convert(currentWidth, previousUnit, unit, currentDPI, {
      precision: 2,
    });
    const h = convert(currentHeight, previousUnit, unit, currentDPI, {
      precision: 2,
    });
    setValue(`${path}.width`, w);
    setValue(`${path}.height`, h);
    refSize.current = { width: w, height: h, dpi: currentDPI };
  }

  const exportWidth = convertToPixels(currentWidth, currentUnit, currentDPI, {
    precision: 2,
  });
  const exportHeight = convertToPixels(currentHeight, currentUnit, currentDPI, {
    precision: 2,
  });

  return (
    <>
      <Label style={labelStyle} title="Description:">
        <Tag>{`${exportWidth} px x ${exportHeight} px @ ${currentDPI}DPI`}</Tag>
      </Label>
      <Label style={labelStyle} title="Size">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <NumberInput2Controller
            name={`${path}.width`}
            control={control}
            style={{ width: 100 }}
            rightElement={<Tag>{currentUnit}</Tag>}
            controllerProps={{ rules: { required: true } }}
            transformValue={(value) => transformSize(value, 'height', 'width')}
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
            rightElement={<Tag>{currentUnit}</Tag>}
            controllerProps={{ rules: { required: true } }}
            transformValue={(value) => transformSize(value, 'width', 'height')}
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
          onItemSelect={handleUnitChange}
        />
      </Label>
      <Label style={labelStyle} title="DPI">
        <NumberInput2Controller
          name={`${path}.dpi`}
          control={control}
          style={{ width: 100 }}
          controllerProps={{ rules: { required: true } }}
          transformValue={transformResolution}
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
