import { Button, ButtonProps } from '@blueprintjs/core';
import { Select, SelectProps } from '@blueprintjs/select';
import { forwardRef, ForwardedRef, ReactNode, useEffect } from 'react';
import { useSelect } from 'react-science/ui';

import { FilterType } from '../utility/filterType';

interface ItemOptions<T> {
  renderItem?: (item: T) => ReactNode;
  defaultSelectedItem?: T;
}

interface ItemSelectOptions<T extends Record<string, any> = SelectDefaultItem> {
  itemTextKey?: keyof FilterType<T, string>;
  itemValueKey?: keyof T;
  selectedItemValue?: T[keyof T];
  placeholder?: string;
  filterPlaceholder?: string;
  getSelectedText?: (item: T) => string;
}

type SelectOptions<T extends Record<string, any> = SelectDefaultItem> =
  ItemOptions<T> & ItemSelectOptions<T>;

type ReturnedUseSelectOptions = ReturnType<typeof useSelect>;

export type Select2Props<T extends Record<string, any> = SelectDefaultItem> =
  Omit<
    SelectProps<T>,
    keyof Omit<ReturnedUseSelectOptions, 'onItemSelect' | 'value'>
  > &
    SelectOptions<T> & {
      selectedButtonProps?: Omit<ButtonProps, 'text'>;
    } & Pick<ButtonProps, 'intent'>;

export function getDefaultSelectedItem<
  T extends Record<string, any> = SelectDefaultItem,
>(items: T[], itemValueKey?: keyof T, value?: any) {
  return items.find((item) => itemValueKey && item[itemValueKey] === value);
}

export interface SelectDefaultItem {
  label: string;
  value: any;
}

function InnerSelect2<T extends Record<string, any> = SelectDefaultItem>(
  props: Select2Props<T>,
  ref,
) {
  const {
    items,
    defaultSelectedItem,
    itemTextKey = 'label',
    itemValueKey = 'value',
    selectedItemValue,
    onItemSelect,
    selectedButtonProps,
    fill,
    intent,
    placeholder = '',
    filterPlaceholder,
    getSelectedText,
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
    itemTextKey: itemTextKey as keyof FilterType<T, string>,
  });

  useEffect(() => {
    const value =
      defaultSelectedItem ??
      getDefaultSelectedItem(items, itemValueKey, selectedItemValue);
    setValue(value || null);
  }, [defaultSelectedItem, itemValueKey, items, selectedItemValue, setValue]);

  const selectedText = item?.[itemTextKey]
    ? typeof getSelectedText === 'function'
      ? getSelectedText(item)
      : String(item[itemTextKey])
    : placeholder;

  return (
    <Select
      items={items}
      filterable={false}
      onItemSelect={(item, event) => {
        innerOnItemSelect(item);
        onItemSelect(item, event);
      }}
      {...defaultSelectProps}
      {...otherProps}
      placeholder={filterPlaceholder}
      fill={fill}
    >
      <Button
        ref={ref}
        fill={fill}
        text={selectedText}
        {...selectedButtonProps}
        rightIcon="double-caret-vertical"
        intent={intent}
      />
    </Select>
  );
}

export const Select2 = forwardRef(InnerSelect2) as <
  T extends Record<string, any> = SelectDefaultItem,
>(
  props: Select2Props<T> & { ref?: ForwardedRef<HTMLButtonElement> },
) => ReturnType<typeof InnerSelect2>;
