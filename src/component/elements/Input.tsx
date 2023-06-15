import debounce from 'lodash/debounce';
import {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  forwardRef,
  ForwardedRef,
  ReactElement,
  useMemo,
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

function check(value, type) {
  if (type === 'number') {
    const pattern = /^(?:-?\d*|\d+)(?:\.\d{0,20})?$/;
    if (value.trim() === '' || pattern.test(value)) {
      return true;
    }
    return false;
  }
  return true;
}

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
  nullable?: boolean;
  datalist?: string[];
}

function identity<T = unknown>(value: T): T {
  return value;
}

function preventPropagate(event) {
  event.stopPropagation();
}

const Input = forwardRef(
  (props: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
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
      format = () => identity,
      onBlur = () => null,
      onFocus = () => null,
      renderIcon = null,
      canClear = false,
      nullable = false,
      onClear,
      datalist = [],
      ...otherProps
    } = props;
    const [val, setVal] = useState(value);
    const valueRef = useRef(value);
    const localRef = useRef<any>();
    const combinedRef = useCombinedRefs([ref, localRef]);

    const debounceOnChange = useMemo(
      () =>
        debounce((val) => {
          onChange?.(val);
        }, debounceTime),
      [debounceTime, onChange],
    );

    useEffect(() => {
      setVal(value);
    }, [value]);

    useEffect(() => {
      if (enableAutoSelect) {
        combinedRef?.current?.select();
      }
    }, [enableAutoSelect, combinedRef]);

    function getValue(value) {
      const val =
        type === 'number'
          ? String(value).trim() === '-'
            ? Number(0)
            : nullable && !value
            ? null
            : Number(value)
          : nullable && !value
          ? null
          : value;

      return format()(val);
    }

    function onChangeHandler(e) {
      e.stopPropagation();
      e.preventDefault();
      const _value: string = e.target.value;
      if (check(_value, type) && checkValue(_value)) {
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
          onChange?.(val);
        }
      }
    }

    function handleKeyDown(event) {
      onKeyDown({
        ...event,
        target: {
          name: event.target.name,
          value: getValue(valueRef.current),
        },
      });
    }

    function handleKeyUp(event) {
      onKeyUp({
        ...event,
        target: {
          name: event.target.name,
          value: getValue(valueRef.current),
        },
      });
    }

    function clearHandler() {
      setVal('');
      onClear?.();
    }

    return (
      <div
        style={{
          ...styles.inputWrapper,
          ...style?.inputWrapper,
        }}
        className={`input ${className || ''}`}
      >
        {renderIcon?.()}
        <input
          {...otherProps}
          ref={combinedRef}
          name={name}
          style={{
            ...styles.input,
            ...style?.input,
          }}
          type="text"
          value={val}
          onChange={onChangeHandler}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onKeyPress={preventPropagate}
          onDoubleClick={(e) => e.stopPropagation()}
          onFocus={onFocus}
          onBlur={onBlur}
          list={`${name || ''}-data-list`}
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

        <datalist id={`${name || ''}-data-list`}>
          {datalist.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </div>
    );
  },
);

export default Input;
