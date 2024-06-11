import { Checkbox } from '@blueprintjs/core';
import { Controller, useFormContext } from 'react-hook-form';

import { LOGGER_LEVELS } from '../../../context/LoggerContext';
import { GroupPane } from '../../../elements/GroupPane';
import Label, { LabelStyle } from '../../../elements/Label';
import { NumberInput2 } from '../../../elements/NumberInput2';
import Select from '../../../elements/Select';
import { useFormValidateField } from '../../../elements/useFormValidateField';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';

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
  const isValid = useFormValidateField();

  return (
    <>
      <GroupPane text="General">
        <Label title="Opacity of dimmed spectra [0 - 1]" style={labelStyle}>
          <Controller
            control={control}
            name="general.dimmedSpectraOpacity"
            render={({ field }) => {
              return (
                <NumberInput2
                  {...field}
                  allowNumericCharactersOnly
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  onValueChange={(valueAsNumber, valueAsString, element) => {
                    field.onChange(valueAsString);
                  }}
                  intent={!isValid(field.name) ? 'danger' : 'none'}
                  style={{ width: 60 }}
                  stepSize={0.1}
                  min={0}
                  max={1}
                />
              );
            }}
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
              return (
                <Select
                  items={SHAPE_RENDERING}
                  key={field.value}
                  defaultValue={field.value}
                  onChange={field.onChange}
                  style={{
                    width: '150px',
                    ...(!isValid('general.spectraRendering') && {
                      border: '1px solid red',
                    }),
                  }}
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
              return (
                <Select
                  items={LOGS_LEVELS}
                  key={field.value}
                  defaultValue={field.value}
                  onChange={field.onChange}
                  style={{
                    width: '100px',
                    ...(!isValid('general.loggingLevel') && {
                      border: '1px solid red',
                    }),
                  }}
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
              return (
                <Select
                  items={LOGS_LEVELS}
                  key={field.value}
                  defaultValue={field.value}
                  onChange={field.onChange}
                  style={{
                    width: '100px',
                    ...(!isValid('general.popupLoggingLevel') && {
                      border: '1px solid red',
                    }),
                  }}
                />
              );
            }}
          />
        </Label>
      </GroupPane>
    </>
  );
}

export default GeneralTabContent;
