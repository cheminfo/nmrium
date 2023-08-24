import debounce from 'lodash/debounce';
import {
  useEffect,
  useRef,
  CSSProperties,
  forwardRef,
  ForwardedRef,
  ReactElement,
  useMemo,
  ChangeEvent,
  useState,
} from 'react';

import useCombinedRefs from '../hooks/useCombinedRefs';

const styles: Record<'input' | 'inputWrapper' | 'clearButton', CSSProperties> =
  {
    inputWrapper: {
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

function mapValue(value) {
  return typeof value === 'number' && value === 0 ? value : value || '';
}

export interface InputStyle {
  input?: CSSProperties;
  inputWrapper?: CSSProperties;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  style?: InputStyle;
  autoSelect?: boolean;
  checkValue?: (element: number | string) => boolean;
  format?: () => (element: string) => number | string;
  renderIcon?: (() => ReactElement) | null;
  canClear?: boolean;
  onClear?: () => void;
  datalist?: string[];
  debounceTime?: number;
}

const Input = forwardRef(
  (props: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      value: externalValue = undefined,
      name,
      style = {
        input: {},
        inputWrapper: {},
      },
      onChange,
      checkValue = () => true,
      type = 'text',
      autoSelect = false,
      className,
      renderIcon,
      canClear = false,
      onClear,
      datalist = [],
      debounceTime = 0,
      ...otherProps
    } = props;

    const [internalValue, setInternalValue] =
      useState<React.InputHTMLAttributes<HTMLInputElement>['value']>();
    const value = debounceTime ? internalValue : externalValue;
    const localRef = useRef<HTMLInputElement>();
    const combinedRef = useCombinedRefs([ref, localRef]);

    const debounceOnChange = useMemo(
      () =>
        debounce((e) => {
          onChange?.(e);
        }, debounceTime),
      [debounceTime, onChange],
    );

    useEffect(() => {
      if (autoSelect) {
        combinedRef?.current?.select();
      }
    }, [autoSelect, combinedRef]);

    useEffect(() => {
      if (debounceTime) {
        setInternalValue(externalValue);
      }
    }, [debounceTime, externalValue]);

    function onChangeHandler(e: ChangeEvent<HTMLInputElement>) {
      e.stopPropagation();
      e.preventDefault();
      const val = e.target.value;
      if (checkValue(val)) {
        if (debounceTime) {
          setInternalValue(val);
          debounceOnChange(e);
        } else {
          onChange?.(e);
        }
      }
    }

    function clearHandler() {
      localRef.current?.setAttribute('value', '');
      onClear?.();
    }

    return (
      <div
        style={{
          ...((renderIcon || canClear) && { padding: '0 5px' }),
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
          type={type}
          value={mapValue(value)}
          onChange={onChangeHandler}
          list={`${name || ''}-data-list`}
        />
        {canClear && value && (
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
