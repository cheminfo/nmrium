import type { CheckboxProps } from '@blueprintjs/core';
import { Checkbox } from '@blueprintjs/core';
import type { ControllerProps, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface CheckControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<CheckboxProps, 'name'>,
    Pick<ControllerProps<TFieldValues>, 'control' | 'name'> {
  controllerProps?: Omit<
    ControllerProps<TFieldValues>,
    'control' | 'name' | 'render'
  >;
}

export function CheckController<TFieldValues extends FieldValues = FieldValues>(
  props: CheckControllerProps<TFieldValues>,
) {
  const { name, control, controllerProps, ...otherProps } = props;

  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field }) => {
        const { value, ...otherFieldProps } = field;
        return (
          <Checkbox checked={value} {...otherFieldProps} {...otherProps} />
        );
      }}
    />
  );
}
