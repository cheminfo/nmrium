import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { CSSProperties, useCallback } from 'react';

import CheckBox, { CheckBoxProps } from '../CheckBox';

interface FormikCheckBoxProps extends Omit<CheckBoxProps, 'style'> {
  name: string;
  label?: string;
  className?: string;
  reverse?: boolean;
  style?: { label?: CSSProperties; checkbox?: CSSProperties };
}

function FormikCheckBox(props: FormikCheckBoxProps) {
  const {
    label,
    name,
    onChange = () => null,
    className = 'checkbox',
    reverse = false,
    style = { label: {}, checkbox: {} },
    ...resProps
  } = props;

  const { values, setFieldValue } = useFormikContext();
  const value = reverse ? !lodashGet(values, name) : lodashGet(values, name);

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.persist();
      onChange(e);
      setFieldValue(name, reverse ? value : !value);
    },
    [name, onChange, reverse, setFieldValue, value],
  );

  return (
    <div className={`${className} check-${value}`}>
      <label
        htmlFor={name}
        className="checkbox-label"
        style={style.label ? style.label : {}}
      >
        {label}
      </label>
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
