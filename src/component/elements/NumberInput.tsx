import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useCallback,
  useRef,
} from 'react';

const styles: Record<
  'container' | 'label' | 'inputContainer' | 'input',
  CSSProperties
> = {
  container: {
    display: 'flex',
  },
  label: {
    lineHeight: 2,
    userSelect: 'none',
    flex: '2',
  },
  inputContainer: {
    flex: '4',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  input: {
    height: '100%',
    width: '100px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
};

export interface NumberInputProps {
  pattern?: string;
  label?: string;
  name?: string;
  step?: any;
  min?: any;
  max?: any;
  defaultValue?: number;
  style?: {
    container?: any;
    label?: any;
    inputContainer?: any;
    input?: any;
  };
  onChange?: (element: any) => void;
  onInput?: () => void;
}

const NumberInput = forwardRef(
  (
    {
      label,
      name,
      defaultValue = 0,
      style = { label: {}, input: {}, container: {}, inputContainer: {} },
      onChange = () => null,
      onInput = () => null,
      pattern = '^d*(.d{0,2})?$',
      step = 'any',
      min = 'any',
      max = 'any',
    }: NumberInputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const localRef = useRef<HTMLInputElement>(null);
    const changeHander = useCallback(
      (e) => {
        if (e.target.checkValidity()) {
          const value = Number(
            e.target.value === '' ? defaultValue : e.target.value,
          );
          onChange({
            ...e,
            target: { ...e.target, name: e.target.name, value },
          });
        } else {
          const _ref: any = ref || localRef;
          _ref.current.value = Number(defaultValue);
        }
      },
      [defaultValue, onChange, ref],
    );
    return (
      <div style={{ ...styles.container, ...style.container }}>
        <span style={{ ...styles.label, ...style.label }}>{label}</span>
        <div style={{ ...styles.inputContainer, ...style.inputContainer }}>
          <input
            ref={ref || localRef}
            name={name}
            style={{ ...styles.input, ...style.input }}
            type="number"
            pattern={pattern}
            defaultValue={defaultValue}
            step={step}
            onChange={changeHander}
            onInput={onInput}
            min={min}
            max={max}
            key={defaultValue}
          />
        </div>
      </div>
    );
  },
);

export default NumberInput;
