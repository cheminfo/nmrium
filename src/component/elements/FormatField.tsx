import { CSSProperties } from 'react';
import { ControllerProps, FieldValues } from 'react-hook-form';

import { CheckController } from './CheckController.js';
import { Input2Controller } from './Input2Controller.js';
import Label, { LabelStyle } from './Label.js';

export const formatFieldInputStyle: CSSProperties = {
  textAlign: 'center',
};

export const fieldLabelStyle: LabelStyle = {
  label: {
    flex: 4,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  wrapper: {
    flex: 8,
  },
};

export interface FormatFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Pick<ControllerProps<TFieldValues>, 'control'> {
  label: string;
  checkFieldName?: ControllerProps<TFieldValues>['name'];
  formatFieldName?: ControllerProps<TFieldValues>['name'];
  disableFormat?: boolean;
  hideFormatField?: boolean;
  hideCheckField?: boolean;
}

export function FormatField<TFieldValues extends FieldValues = FieldValues>(
  props: FormatFieldProps<TFieldValues>,
) {
  const {
    label,
    checkFieldName,
    formatFieldName,
    disableFormat = false,
    hideFormatField = false,
    hideCheckField = false,
    control,
  } = props;

  return (
    <Label title={label} style={fieldLabelStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          ...(hideFormatField && { height: '25px' }),
        }}
      >
        {!hideCheckField && checkFieldName ? (
          <CheckController name={checkFieldName} control={control} />
        ) : (
          <div style={{ width: '23px' }} />
        )}
        {!hideFormatField && formatFieldName && (
          <Input2Controller
            style={formatFieldInputStyle}
            name={formatFieldName}
            control={control}
            disabled={disableFormat}
            controllerProps={{ rules: { required: true } }}
          />
        )}
      </div>
    </Label>
  );
}
