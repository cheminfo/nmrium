import type { HTMLInputProps, NumericInputProps } from '@blueprintjs/core';
import { Classes, NumericInput } from '@blueprintjs/core';
import debounce from 'lodash/debounce.js';
import type { ForwardedRef } from 'react';
import {
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useCombinedRefs from '../hooks/useCombinedRefs.js';

interface ValueProps
  extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'style'>,
    Pick<NumericInputProps, 'onValueChange' | 'value'> {
  checkValue?: (element?: number) => boolean;
  debounceTime?: number;
  autoSelect?: boolean;
}
interface UseInputProps extends Omit<ValueProps, 'name'> {
  ref: ForwardedRef<HTMLInputElement>;
}
export interface NumberInput2Props
  extends Omit<
      Omit<HTMLInputProps, 'size'> & NumericInputProps,
      'value' | 'onValueChange'
    >,
    ValueProps {
  format?: () => (element: string) => number | string;
}

function useNumberInput(props: UseInputProps) {
  const {
    value: externalValue,
    debounceTime,
    onValueChange,
    ref,
    autoSelect,
    checkValue,
  } = props;
  const [internalValue, setValue] = useState<number | string>();
  const localRef = useRef<HTMLInputElement>(null);
  const innerRef = useCombinedRefs([ref, localRef]);
  const value = debounceTime ? internalValue : externalValue;
  const [isDebounced, setDebouncedStatus] = useState<boolean>(false);

  const debounceOnValueChange = useMemo(
    () =>
      debounce(
        (
          valueAsNumber: number,
          valueAsString: string,
          inputElement: HTMLInputElement | null,
        ) => {
          onValueChange?.(valueAsNumber, valueAsString, inputElement);
          setDebouncedStatus(true);
        },
        debounceTime,
      ),
    [debounceTime, onValueChange],
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

  function handleValueChange(
    valueAsNumber: number,
    valueAsString: string,
    inputElement: HTMLInputElement | null,
  ) {
    setDebouncedStatus(false);

    if (!checkValue || checkValue?.(valueAsNumber)) {
      if (debounceTime) {
        setValue(valueAsString);
        debounceOnValueChange(valueAsNumber, valueAsString, inputElement);
      } else {
        onValueChange?.(valueAsNumber, valueAsString, inputElement);
      }
    }
  }

  return {
    handleValueChange,
    debounceOnValueChange,
    isDebounced,
    value,
    innerRef,
  };
}

function getIcon(leftIcon: any) {
  if (isValidElement(leftIcon)) {
    return <span className={Classes.ICON}>{leftIcon}</span>;
  }

  return leftIcon;
}

function getClasses(isDebounced: boolean) {
  const classes = ['numeric-input'];
  if (isDebounced) {
    classes.push('debounce-end');
  }

  return classes.join(' ');
}

function InnerNumberInput(props: NumberInput2Props, ref: any) {
  const {
    debounceTime = 0,
    onValueChange,
    checkValue,
    value: externalValue,
    leftIcon,
    autoSelect = false,
    ...otherInputProps
  } = props;

  const { handleValueChange, isDebounced, value, innerRef } = useNumberInput({
    value: externalValue,
    debounceTime,
    autoSelect,
    ref,
    onValueChange,
    checkValue,
  });

  const icon = getIcon(leftIcon);
  const classes = getClasses(isDebounced);

  return (
    <NumericInput
      leftIcon={icon}
      inputClassName={classes}
      inputRef={innerRef}
      onValueChange={handleValueChange}
      value={value}
      selectAllOnFocus={autoSelect}
      {...otherInputProps}
    />
  );
}

const NumberInput2 = forwardRef(InnerNumberInput);

export { NumberInput2 };
