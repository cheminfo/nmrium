import { Checkbox, Tag } from '@blueprintjs/core';
import { Controller, useFormContext } from 'react-hook-form';

import { LOGGER_LEVELS } from '../../../context/LoggerContext.js';
import { GroupPane } from '../../../elements/GroupPane.js';
import type { LabelStyle } from '../../../elements/Label.js';
import Label from '../../../elements/Label.js';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller.js';
import { Select2 } from '../../../elements/Select2.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';

const labelStyle: LabelStyle = {
  label: { flex: 6 },
  wrapper: { flex: 6 },
  container: { paddingBottom: '5px' },
};

interface SelectItem {
  label: string;
  value: string;
}

const SHAPE_RENDERING: SelectItem[] = [
  {
    label: 'Auto',
    value: 'auto',
  },
  {
    label: 'Optimize speed',
    value: 'optimizeSpeed',
  },
  {
    label: 'Crisp edges',
    value: 'crispEdges',
  },
  {
    label: 'Geometric precision',
    value: 'geometricPrecision',
  },
];

const LOGS_LEVELS = Object.keys(LOGGER_LEVELS).map((level) => ({
  label: level.replace(/^\w/, (c) => c.toUpperCase()),
  value: level,
}));

function GeneralTabContent() {
  const { register, control } = useFormContext<WorkspaceWithSource>();

  return (
    <>
      <GroupPane text="General">
        <Label title="Opacity of dimmed spectra [0 - 1]" style={labelStyle}>
          <NumberInput2Controller
            control={control}
            name="general.dimmedSpectraOpacity"
            min={0}
            max={1}
            stepSize={0.1}
            style={{ width: 60 }}
          />
        </Label>
        <Label title="Invert actions" style={labelStyle}>
          <Checkbox style={{ margin: 0 }} {...register(`general.invert`)} />
        </Label>
      </GroupPane>
      <GroupPane text="Experimental features">
        <Label title="Enable experimental features" style={labelStyle}>
          <Checkbox
            style={{ margin: 0 }}
            {...register(`display.general.experimentalFeatures.display`)}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Rendering">
        <Label title="Spectra rendering" style={labelStyle}>
          <Controller
            control={control}
            name="general.spectraRendering"
            render={({ field }) => {
              const { value, onChange } = field;

              return (
                <Select2<SelectItem>
                  items={SHAPE_RENDERING}
                  itemTextKey="label"
                  itemValueKey="value"
                  selectedItemValue={value}
                  onItemSelect={(item) => onChange(item.value)}
                />
              );
            }}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Logging settings">
        <Label title="Level" style={labelStyle}>
          <Controller
            control={control}
            name="general.loggingLevel"
            render={({ field }) => {
              const { value, onChange } = field;

              return (
                <Select2<SelectItem>
                  items={LOGS_LEVELS}
                  itemTextKey="label"
                  itemValueKey="value"
                  selectedItemValue={value}
                  onItemSelect={(item) => onChange(item.value)}
                />
              );
            }}
          />
        </Label>
        <Label title="Popup logging level" style={labelStyle}>
          <Controller
            control={control}
            name="general.popupLoggingLevel"
            render={({ field }) => {
              const { value, onChange } = field;
              return (
                <Select2<SelectItem>
                  items={LOGS_LEVELS}
                  itemTextKey="label"
                  itemValueKey="value"
                  selectedItemValue={value}
                  onItemSelect={(item) => onChange(item.value)}
                />
              );
            }}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Peaks label">
        <Label title="Margin top" style={labelStyle}>
          <NumberInput2Controller
            control={control}
            name="peaksLabel.marginTop"
            min={0}
            max={1}
            stepSize={0.1}
            style={{ width: 70 }}
            rightElement={<Tag>px</Tag>}
          />
        </Label>
      </GroupPane>
    </>
  );
}

export default GeneralTabContent;
