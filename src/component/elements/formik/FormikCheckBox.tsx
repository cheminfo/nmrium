import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { CSSProperties, useCallback } from 'react';

import CheckBox, { CheckBoxProps } from '../CheckBox';

export interface FormikCheckBoxProps extends Omit<CheckBoxProps, 'style'> {
  name: string;
  label?: string;
  className?: string;
  reverse?: boolean;
  style?: {
    container?: CSSProperties;
    label?: CSSProperties;
    checkbox?: CSSProperties;
  };
  defaultValue?: any;
}

function FormikCheckBox(props: FormikCheckBoxProps) {
  const {
    label,
    name,
    onChange = () => null,
    className = 'checkbox',
    reverse = false,
    style = { container: {}, label: {}, checkbox: {} },
    defaultValue,
    ...resProps
  } = props;

  const { values, setFieldValue } = useFormikContext();
  const value = reverse
    ? !lodashGet(values, name, defaultValue)
    : lodashGet(values, name, defaultValue);

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.persist();
      onChange(e);
      setFieldValue(name, reverse ? value : !value);
    },
    [name, onChange, reverse, setFieldValue, value],
  );

  return (
    <div
      className={`${className} check-${value}`}
      style={style.container ? style.container : {}}
    >
      {label && (
        <label
          htmlFor={name}
          className="checkbox-label"
          style={style.label ? style.label : {}}
        >
          {label}
        </label>
      )}
      <CheckBox
        {...resProps}
        name={name}
        checked={value}
        onChange={changeHandler}
        style={style.checkbox ? style.checkbox : {}}
      />
    </div>
  );
}

export default FormikCheckBox;
