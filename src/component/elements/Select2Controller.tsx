import { Controller, ControllerProps, FieldValues } from 'react-hook-form';

import { Select2, Select2Props, SelectDefaultItem } from './Select2.js';

type Select2ControllerProps<
  T extends Record<string, any> = SelectDefaultItem,
  TFieldValues extends FieldValues = FieldValues,
> = {
  controllerProps?: Omit<ControllerProps<TFieldValues>, 'render'>;
} & Pick<ControllerProps<TFieldValues>, 'control' | 'name'> &
  Omit<Select2Props<T>, 'onItemSelect' | 'selectedItemValue'> &
  Partial<Pick<Select2Props<T>, 'onItemSelect'>>;

export function Select2Controller<
  T extends Record<string, any>,
  TFieldValues extends FieldValues = FieldValues,
>(props: Select2ControllerProps<T, TFieldValues>) {
  const {
    name,
    control,
    controllerProps = {},
    onItemSelect,
    intent,
    itemValueKey = 'value',
    ...otherSelectProps
  } = props;
  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field, fieldState: { invalid } }) => {
        return (
          <Select2<T>
            itemValueKey={itemValueKey}
            selectedItemValue={field.value}
            onItemSelect={(item, event) => {
              field.onChange(item[itemValueKey]);
              onItemSelect?.(item, event);
            }}
            {...otherSelectProps}
            intent={invalid ? 'danger' : intent}
          />
        );
      }}
    />
  );
}
