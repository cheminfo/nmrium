import { Button, ButtonProps } from '@blueprintjs/core';
import { Select, SelectProps } from '@blueprintjs/select';
import { useEffect } from 'react';
import { useSelect } from 'react-science/ui';

import { FilterType } from '../utility/filterType';

type SelectOptions<T> = Parameters<typeof useSelect<T>>[0] & {
  itemTextKey: keyof FilterType<T, string>;
  itemValueKey?: keyof T;
  selectedItemValue?: T[keyof T];
};

type ReturnedUseSelectOptions = ReturnType<typeof useSelect>;

type Select2Props<T> = Omit<
  SelectProps<T>,
  keyof Omit<ReturnedUseSelectOptions, 'onItemSelect' | 'value'>
> &
  SelectOptions<T> & { selectedButtonProps?: Omit<ButtonProps, 'text'> };

export function getDefaultSelectedItem<T>(
  items: T[],
  itemValueKey?: keyof T,
  value?: any,
) {
  return items.find((item) => itemValueKey && item[itemValueKey] === value);
}

interface DefaultItem {
  label: string;
  value: string;
}

export function Select2<T extends DefaultItem>(props: Select2Props<T>) {
  const {
    items,
    defaultSelectedItem,
    itemTextKey,
    itemValueKey,
    selectedItemValue,
    onItemSelect,
    selectedButtonProps,
    fill,
    ...otherProps
  } = props;

  const {
    value: item,
    onItemSelect: innerOnItemSelect,
    setValue,
    ...defaultSelectProps
  } = useSelect<T>({
    defaultSelectedItem:
      defaultSelectedItem ??
      getDefaultSelectedItem(items, itemValueKey, selectedItemValue),
    itemTextKey,
  });

  useEffect(() => {
    const value =
      defaultSelectedItem ??
      getDefaultSelectedItem(items, itemValueKey, selectedItemValue);
    setValue(value || null);
  }, [defaultSelectedItem, itemValueKey, items, selectedItemValue, setValue]);

  return (
    <Select<T>
      items={items}
      filterable={false}
      onItemSelect={(item, event) => {
        innerOnItemSelect(item);
        onItemSelect(item, event);
      }}
      {...defaultSelectProps}
      {...otherProps}
      fill={fill}
    >
      <Button
        fill={fill}
        text={item?.[itemTextKey] ? String(item[itemTextKey]) : ''}
        {...selectedButtonProps}
        rightIcon="double-caret-vertical"
      />
    </Select>
  );
}
