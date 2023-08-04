import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import useCombinedRefs from '../hooks/useCombinedRefs';

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
  style?: CSSProperties;
  enableAutoSelect?: boolean;
}

const NumberInput = forwardRef(
  (
    {
      name,
      value: valueProp,
      style = {},
      onChange,
      pattern = '^\\d*.\\d*$',
      step = 'any',
      min = 'any',
      max = 'any',
      enableAutoSelect = false,
      ...otherProps
    }: NumberInputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const combinedRef = useCombinedRefs([ref]);

    useEffect(() => {
      if (enableAutoSelect) {
        combinedRef?.current?.select();
      }
    }, [combinedRef]);

    return (
      <input
        ref={combinedRef}
        name={name}
        style={{ ...inputStyle, ...style }}
        type="number"
        pattern={pattern}
        value={valueProp}
        step={step}
        onChange={onChange}
        min={min}
        max={max}
        {...otherProps}
      />
    );
  },
);

export default NumberInput;
