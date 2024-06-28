import { Controller, ControllerProps, FieldValues } from 'react-hook-form';

import { Select2, Select2Props, SelectDefaultItem } from './Select2';

type Select2ControllerProps<
  T extends SelectDefaultItem = SelectDefaultItem,
  TFieldValues extends FieldValues = FieldValues,
> = {
  controllerProps?: Omit<ControllerProps<TFieldValues>, 'render'>;
} & Pick<ControllerProps<TFieldValues>, 'control' | 'name'> &
  Omit<Select2Props<T>, 'onItemSelect' | 'selectedItemValue'> &
  Partial<Pick<Select2Props<T>, 'onItemSelect'>>;

export function Select2Controller<
  T extends SelectDefaultItem = SelectDefaultItem,
  TFieldValues extends FieldValues = FieldValues,
>(props: Select2ControllerProps<T, TFieldValues>) {
  const {
    name,
    control,
    controllerProps = {},
    onItemSelect,
    ...otherSelectProps
  } = props;
  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field }) => {
        return (
          <Select2<T>
            selectedItemValue={field.value}
            onItemSelect={(item, event) => {
              field.onChange(item.value);
              onItemSelect?.(item, event);
            }}
            {...otherSelectProps}
          />
        );
      }}
    />
  );
}
