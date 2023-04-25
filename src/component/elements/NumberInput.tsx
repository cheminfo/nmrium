import { CSSProperties, ForwardedRef, forwardRef } from 'react';

const inputStyle: CSSProperties = {
  height: '100%',
  width: '100px',
  borderRadius: '5px',
  border: '0.55px solid #c7c7c7',
  textAlign: 'center',
};
export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  pattern?: string;
  name?: string;
  step?: any;
  min?: any;
  max?: any;
  value?: number;
  defaultValue?: number;
  style?: CSSProperties;
}

const NumberInput = forwardRef(
  (
    {
      name,
      value: valueProp,
      defaultValue = 0,
      style = {},
      onChange,
      pattern = '^\\d*.\\d*$',
      step = 'any',
      min = 'any',
      max = 'any',
    }: NumberInputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <input
        ref={ref}
        name={name}
        style={{ ...inputStyle, ...style }}
        type="number"
        pattern={pattern}
        value={valueProp}
        defaultValue={defaultValue}
        step={step}
        onChange={onChange}
        min={min}
        max={max}
      />
    );
  },
);

export default NumberInput;
