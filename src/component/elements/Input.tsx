import debounce from 'lodash/debounce';
import { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';

import { forwardRefWithAs } from '../../utils';
import useCombinedRefs from '../hooks/useCombinedRefs';

const styles: Record<'label' | 'input', CSSProperties> = {
  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
  input: {
    height: '100%',
    width: '100px',
    borderRadius: '5px',
    borderWidth: '0.55px',
    borderColor: '#c7c7c7',
    borderStyle: 'solid',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
};

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  name?: string;
  label?: string;
  value?: any;
  style?: {
    label?: any;
    input?: any;
    container?: any;
  };
  className?: string;
  type?: 'text' | 'number';
  enableAutoSelect?: boolean;
  debounceTime?: number;
  onFocus?: (element?: any) => void;
  onBlur?: () => void;
  onChange?: (element: any) => void;
  checkValue?: (element: any) => void;
  onKeyDown?: (element: any) => void;
  format?: () => (element: any) => any;
}

const Input = forwardRefWithAs(
  (
    {
      label,
      value = '',
      name,
      style = { label: {}, input: {}, container: {} },
      onChange = () => null,
      debounceTime = 0,
      onKeyDown = () => null,
      checkValue = () => true,
      type = 'text',
      enableAutoSelect = false,
      className,
      format = () => (value) => value,
      onBlur = () => null,
      onFocus = () => null,
      ...props
    }: InputProps,
    ref,
  ) => {
    const [val, setVal] = useState(value);
    const localRef = useRef<any>();
    const combinedRef = useCombinedRefs([ref, localRef]);

    const debounceOnChange = useRef(
      debounce((value) => {
        onChange(value);
      }, debounceTime),
    ).current;

    useEffect(() => {
      setVal(value);
    }, [value]);

    useEffect(() => {
      if (enableAutoSelect) {
        combinedRef?.current?.select();
      }
    }, [enableAutoSelect, combinedRef]);

    const getValue = useCallback(
      (value) => {
        const formatValue = format();
        return formatValue(
          type === 'number'
            ? String(value).trim() === '-'
              ? Number(0)
              : Number(value)
            : value,
        );
      },
      [format, type],
    );

    const onChangeHandler = useCallback(
      (e) => {
        e.persist();
        e.stopPropagation();
        e.preventDefault();

        function check(value) {
          if (type === 'number') {
            const pattern = /^(?:-?[0-9]*|[0-9]\d*)(?:\.\d{0,20})?$/;
            if (value.trim() === '' || pattern.test(value)) {
              return true;
            }
            return false;
          }
          return true;
        }

        const _value = e.target.value;
        if (check(_value) && checkValue(_value)) {
          const formatValue = format();

          setVal(formatValue(_value));

          const val = {
            ...e,
            target: { name: e.target.name, value: getValue(_value) },
          };

          if (debounceTime) {
            debounceOnChange(val);
          } else {
            onChange(val);
          }
        }
      },
      [
        checkValue,
        debounceOnChange,
        debounceTime,
        format,
        getValue,
        onChange,
        type,
      ],
    );

    const handleKeyDown = useCallback(
      (event) => {
        event.persist();
        onKeyDown({
          ...event,
          target: { name: event.target.name, value: getValue(val) },
        });
      },
      [getValue, onKeyDown, val],
    );
    const preventPropagate = useCallback((event) => {
      event.stopPropagation();
    }, []);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          ...(style?.container ? style.container : {}),
        }}
      >
        {label && (
          <span
            style={{
              ...styles.label,
              ...(style?.label ? style.label : {}),
            }}
            className="label"
          >
            {label}
          </span>
        )}
        <input
          {...props}
          ref={combinedRef}
          name={name}
          data-test-id={name ? `input-${name}` : ''}
          style={{
            ...styles.input,
            ...(style?.input ? style.input : {}),
          }}
          type="text"
          value={val}
          onChange={onChangeHandler}
          onKeyDown={handleKeyDown}
          onKeyPress={preventPropagate}
          onDoubleClick={(e) => e.stopPropagation()}
          className={`input ${className || ''}`}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    );
  },
);

export default Input;
