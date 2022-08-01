import { useCallback, forwardRef, ForwardedRef, CSSProperties } from 'react';

export interface CheckBoxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: CSSProperties;
}

const CheckBox = forwardRef(
  (props: CheckBoxProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      checked,
      defaultChecked,
      disabled = false,
      name,
      onChange = () => null,
      style = {},
    } = props;

    const handleCheck = useCallback(
      (e) => {
        onChange(e);
      },
      [onChange],
    );

    return (
      <input
        ref={ref}
        type="checkbox"
        name={name}
        id={name}
        onChange={handleCheck}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        style={style}
      />
    );
  },
);

export default CheckBox;
