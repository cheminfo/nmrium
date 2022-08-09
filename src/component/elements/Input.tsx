import debounce from 'lodash/debounce';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  CSSProperties,
  forwardRef,
  ForwardedRef,
  ReactElement,
} from 'react';

import useCombinedRefs from '../hooks/useCombinedRefs';

const styles: Record<
  'label' | 'input' | 'inputWrapper' | 'clearButton',
  CSSProperties
> = {
  label: {
    lineHeight: 2,
    userSelect: 'none',
  },

  inputWrapper: {
    height: '100%',
    width: '100px',
    borderRadius: '5px',
    borderWidth: '0.55px',
    borderColor: '#c7c7c7',
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    outline: 'none',
    flex: 1,
    height: '100%',
    textAlign: 'center',
    width: '100%',
  },
  clearButton: {
    height: 'calc(100% - 4px)',
    borderRadius: '50%',
    backgroundColor: 'gray',
    color: 'white',
    aspectRatio: '1',
    fontSize: '60%',
    padding: 0,
  },
};

export type InputKeyboardEvent = React.KeyboardEvent & {
  target: { name: string; value: string | number };
};

export interface InputStyle {
  input?: CSSProperties;
  inputWrapper?: CSSProperties;
}
export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'style' | 'onKeyDown' | 'onKeyUp'
  > {
  style?: InputStyle;
  enableAutoSelect?: boolean;
  debounceTime?: number;
  checkValue?: (element: number | string) => boolean;
  format?: () => (element: string) => number | string;
  renderIcon?: (() => ReactElement) | null;
  canClear?: boolean;
  onClear?: () => void;
  onKeyDown?: (event: InputKeyboardEvent) => void;
  onKeyUp?: (event: InputKeyboardEvent) => void;
}

const Input = forwardRef(
  (
    {
      value = '',
      name,
      style = {
        input: {},
        inputWrapper: {},
      },
      onChange = () => null,
      debounceTime = 0,
      onKeyDown = () => null,
      onKeyUp = () => null,
      checkValue = () => true,
      type = 'text',
      enableAutoSelect = false,
      className,
      format = () => (value) => value,
      onBlur = () => null,
      onFocus = () => null,
      renderIcon = null,
      canClear = false,
      onClear,
      ...props
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const [val, setVal] = useState(value);
    const valueRef = useRef(value);
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

        const _value: string = e.target.value;
        if (check(_value) && checkValue(_value)) {
          const formatValue = format();

          setVal(formatValue(_value));
          valueRef.current = _value;
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
        onKeyDown({
          ...event,
          target: {
            name: event.target.name,
            value: getValue(valueRef.current),
          },
        });
      },
      [getValue, onKeyDown],
    );
    const handleKeyUp = useCallback(
      (event) => {
        onKeyUp({
          ...event,
          target: {
            name: event.target.name,
            value: getValue(valueRef.current),
          },
        });
      },
      [getValue, onKeyUp],
    );
    const preventPropagate = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const clearHandler = useCallback(() => {
      setVal('');
      onClear?.();
    }, [onClear]);

    return (
      <div
        style={{
          ...styles.inputWrapper,
          ...(style?.inputWrapper ? style.inputWrapper : {}),
        }}
        className={`input ${className || ''}`}
      >
        {renderIcon?.()}
        <input
          {...props}
          ref={combinedRef}
          name={name}
          style={{
            ...styles.input,
            ...(style?.input ? style.input : {}),
          }}
          data-test-id={name ? `input-${name}` : ''}
          type="text"
          value={val}
          onChange={onChangeHandler}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onKeyPress={preventPropagate}
          onDoubleClick={(e) => e.stopPropagation()}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {canClear && val && (
          <button
            type="button"
            style={styles.clearButton}
            onClick={clearHandler}
          >
            <span style={{ display: 'block', margin: '0 auto' }}>&#10005;</span>
          </button>
        )}
      </div>
    );
  },
);

export default Input;
