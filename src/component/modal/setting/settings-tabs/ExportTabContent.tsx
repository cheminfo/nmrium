import {
  Button,
  Radio,
  RadioGroup,
  Section,
  SectionCard,
  SegmentedControl,
  Tag,
} from '@blueprintjs/core';
import type {
  AdvanceExportSettings,
  BasicExportSettings,
  ExportPreferences,
} from 'nmr-load-save';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { CheckController } from '../../../elements/CheckController.js';
import Label from '../../../elements/Label.js';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller.js';
import { Select2Controller } from '../../../elements/Select2Controller.js';
import { units } from '../../../elements/export/units.js';
import { useExportConfigurer } from '../../../elements/export/useExportConfigurer.js';
import { getExportDefaultOptionsByMode } from '../../../elements/export/utilities/getExportOptions.js';
import type { Mode } from '../../../elements/export/utilities/getModes.js';
import { MODES } from '../../../elements/export/utilities/getModes.js';
import type { SizeItem } from '../../../elements/print/pageSize.js';
import { getSizesList } from '../../../elements/print/pageSize.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { labelStyle } from '../../SaveAsModal.js';

export function ExportTabContent() {
  return (
    <>
      <Section
        collapsible
        collapseProps={{ defaultIsOpen: true }}
        title="Export PNG to file options"
        compact={false}
      >
        <SectionCard padded>
          <ExportOptions exportAs="png" />
        </SectionCard>
      </Section>
      <Section
        collapsible
        collapseProps={{ defaultIsOpen: false }}
        title="Export SVG to file options"
        compact={false}
      >
        <SectionCard padded>
          <ExportOptions exportAs="svg" />
        </SectionCard>
      </Section>
      <Section
        collapsible
        collapseProps={{ defaultIsOpen: false }}
        title="Export PNG to clipboard options"
        compact={false}
      >
        <SectionCard padded>
          <ExportOptions exportAs="clipboard" />
        </SectionCard>
      </Section>
    </>
  );
}

interface ExportOptionsProps {
  exportAs: keyof ExportPreferences;
}

export function ExportOptions(props: ExportOptionsProps) {
  const { exportAs } = props;
  const path: `export.${keyof ExportPreferences}` = `export.${exportAs}`;
  const {
    setValue,
    control,
    formState: { isValid, errors },
    getValues,
    watch,
  } = useFormContext<WorkspaceWithSource>();
  const defaultValue = getValues(path);
  const currentOptions = watch(path) || defaultValue;

  const {
    dpi = 0,
    unit,
    mode: originalMode,
    layout,
  } = currentOptions as AdvanceExportSettings & BasicExportSettings;
  const [mode, setMode] = useState<Mode>(originalMode);

  const {
    widthInPixel,
    heightInPixel,
    isAspectRatioEnabled,
    changeDPI,
    enableAspectRatio,
    changeSize,
    changeUnit,
  } = useExportConfigurer(currentOptions);

  let sizesList: SizeItem[] = [];

  if (layout) {
    sizesList = getSizesList(layout);
  }

  function handleChangeMode(mode) {
    const options = defaultValue;
    setMode(mode);
    if (options.mode === mode) {
      setValue(path, defaultValue);
    } else {
      setValue(path, getExportDefaultOptionsByMode(mode));
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '15px',
        }}
      >
        <SegmentedControl
          defaultValue="list"
          inline
          options={MODES}
          value={mode}
          onValueChange={handleChangeMode}
        />
      </div>

      <Label style={labelStyle} title="Description:">
        <Tag
          intent={
            !isValid && Object.keys(errors).length > 0 ? 'danger' : 'none'
          }
        >{`${widthInPixel} px x ${heightInPixel} px @ ${dpi}DPI`}</Tag>
      </Label>
      {mode === 'basic' && (
        <>
          <Label style={labelStyle} title="Size">
            <Select2Controller
              control={control}
              name={`${path}.size`}
              items={sizesList}
            />
          </Label>
          <Label style={labelStyle} title="Layout">
            <Controller
              name={`${path}.layout`}
              control={control}
              render={({ field }) => {
                const { value, ref, ...otherFieldProps } = field;
                return (
                  <RadioGroup inline selectedValue={value} {...otherFieldProps}>
                    <Radio label="Portrait" value="portrait" />
                    <Radio label="Landscape" value="landscape" />
                  </RadioGroup>
                );
              }}
            />
          </Label>
        </>
      )}
      {mode === 'advance' && (
        <>
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
        </>
      )}
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
        style={{ marginTop: '30px' }}
        control={control}
        name={`${path}.useDefaultSettings`}
        label="Don't show the options dialog during export and use current settings"
      />
    </>
  );
}
