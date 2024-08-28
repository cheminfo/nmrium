import { Classes, InputGroupProps, MenuItem } from '@blueprintjs/core';
import { Suggest } from '@blueprintjs/select';
import debounce from 'lodash/debounce';
import {
  useEffect,
  useRef,
  useMemo,
  useState,
  isValidElement,
  forwardRef,
  ForwardedRef,
} from 'react';

import useCombinedRefs from '../hooks/useCombinedRefs';

interface UseInputProps extends BaseInputProps {
  value?: string;
  ref: ForwardedRef<HTMLInputElement>;
}

interface BaseInputProps {
  debounceTime?: number;
  autoSelect?: boolean;
  checkValue?: (element?: number | string) => boolean;
  onChange?: (
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export interface Input2Props<FilterItem extends string = string>
  extends Omit<InputGroupProps, 'onChange' | 'inputRef'>,
    BaseInputProps {
  getFilterValue?: (item: FilterItem) => string;
  filterItems?: FilterItem[];
}

function useInput(props: UseInputProps) {
  const {
    value: externalValue,
    debounceTime,
    ref,
    autoSelect,
    onChange,
    checkValue,
  } = props;
  const [internalValue, setValue] = useState<string>();
  const value = debounceTime ? internalValue : externalValue;
  const localRef = useRef<HTMLInputElement>();
  const innerRef = useCombinedRefs([ref, localRef]);
  const [isDebounced, setDebouncedStatus] = useState<boolean>(false);

  const debounceOnChange = useMemo(
    () =>
      debounce((val: string, event?: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(val, event);
        setDebouncedStatus(true);
      }, debounceTime),
    [debounceTime, onChange],
  );

  useEffect(() => {
    if (debounceTime) {
      setValue(externalValue);
    }
  }, [debounceTime, externalValue]);

  useEffect(() => {
    if (autoSelect) {
      innerRef?.current?.select();
    }
  }, [autoSelect, innerRef]);

  function handleChange(
    val: string,
    event?: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!event) return;

    event?.stopPropagation();
    event?.preventDefault();
    setDebouncedStatus(false);

    if (!checkValue || checkValue?.(val)) {
      if (debounceTime) {
        setValue(val);
        debounceOnChange(val, event);
      } else {
        onChange?.(val, event);
      }
    }
  }

  return {
    handleChange,
    setValue,
    innerRef,
    debounceOnChange,
    isDebounced,
    value,
  };
}

function getIcon(leftIcon) {
  if (isValidElement(leftIcon)) {
    return <span className={Classes.ICON}>{leftIcon}</span>;
  }

  return leftIcon;
}

function getClasses(isDebounced: boolean) {
  const classes = ['text-input'];
  if (isDebounced) {
    classes.push('debounce-end');
  }

  return classes.join(' ');
}

function InnerInput<FilterItem extends string = string>(
  props: Input2Props<FilterItem>,
  ref,
) {
  const {
    debounceTime = 0,
    onChange,
    checkValue,
    value: externalValue,
    getFilterValue = (item: FilterItem) => item,
    filterItems,
    leftIcon,
    autoSelect = false,
    fill,
    name,
    ...otherInputProps
  } = props;

  const { handleChange, setValue, isDebounced, innerRef, value } = useInput({
    value: externalValue,
    ref,
    autoSelect,
    debounceTime,
    onChange,
    checkValue,
  });

  function handleItemSelect(item: FilterItem, event) {
    const val = getFilterValue(item);
    setValue(val);
    event = { ...event, target: { ...event.target, name } };
    onChange?.(val, event);
  }

  function renderItem(item: FilterItem, { handleClick, modifiers }) {
    const { active, matchesPredicate } = modifiers;
    if (!matchesPredicate) {
      return null;
    }

    const val = getFilterValue(item);
    return (
      <MenuItem
        key={val}
        text={val}
        onClick={handleClick}
        roleStructure="listoption"
        active={active}
      />
    );
  }

  function itemPredicate(query: string, item: FilterItem) {
    return getFilterValue(item).toLowerCase().includes(query.toLowerCase());
  }

  const icon = getIcon(leftIcon);
  const classes = getClasses(isDebounced);

  return (
    <Suggest
      inputProps={{
        placeholder: '',
        leftIcon: icon,
        inputClassName: classes,
        inputRef: innerRef,
        name,
        ...otherInputProps,
      }}
      items={[]}
      query={value ?? ''}
      onQueryChange={handleChange}
      fill={fill}
      popoverProps={{ disabled: true }}
      {...(filterItems &&
        filterItems.length > 0 && {
          items: filterItems,
          itemRenderer: renderItem,
          onItemSelect: handleItemSelect,
          inputValueRenderer: getFilterValue,
          itemPredicate,
          popoverProps: { minimal: true, placement: 'bottom' },
          popoverContentProps: {
            style: {
              maxHeight: '250px',
              overflowY: 'auto',
            },
          },
          noResults: (
            <MenuItem disabled text="No results." roleStructure="listoption" />
          ),
        })}
      closeOnSelect
      resetOnQuery
    />
  );
}

const Input2 = forwardRef(InnerInput);

export { Input2 };
