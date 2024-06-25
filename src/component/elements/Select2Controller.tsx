import { Controller, ControllerProps, FieldValues } from 'react-hook-form';

import { Select2, Select2Props } from './Select2';

type Select2ControllerProps<TFieldValues extends FieldValues = FieldValues> = {
  selectProps?: Omit<Select2Props<any>, 'onItemSelect' | 'selectedItemValue'>;
} & Omit<ControllerProps<TFieldValues>, 'render'>;

export function Select2Controller<
  TFieldValues extends FieldValues = FieldValues,
>(props: Select2ControllerProps<TFieldValues>) {
  const {
    selectProps: { items, ...otherSelectProps } = { items: [] },
    ...controllerProps
  } = props;
  return (
    <Controller
      {...controllerProps}
      render={({ field }) => {
        return (
          <Select2
            itemTextKey="label"
            selectedItemValue={field.value}
            onItemSelect={(item) => field.onChange(item.value)}
            items={items}
            {...otherSelectProps}
          />
        );
      }}
    />
  );
}
