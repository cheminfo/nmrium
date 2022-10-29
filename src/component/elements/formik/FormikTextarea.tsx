import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, useEffect, useMemo, CSSProperties } from 'react';

interface FormikTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  name: string;
  style?: CSSProperties;
  value?: string;
  className?: string;
}

function FormikTextarea(props: FormikTextareaProps) {
  const {
    name,
    style = {},
    onChange = () => null,
    className = '',
    value,
    placeholder = '',
    ...resProps
  } = props;

  const { values, handleChange, setFieldValue, errors } = useFormikContext();

  const changeHandler = useCallback(
    (e) => {
      onChange(e);
      handleChange(e);
    },
    [handleChange, onChange],
  );

  useEffect(() => {
    if (value) {
      setFieldValue(name, value);
    }
  }, [name, setFieldValue, value]);

  const isInvalid = useMemo(() => {
    return lodashGet(errors, name);
  }, [errors, name]);

  return (
    <textarea
      {...{ name, className, placeholder }}
      value={value || lodashGet(values, name)}
      onChange={changeHandler}
      style={{
        ...style,
        ...(isInvalid && {
          borderColor: 'red',
          borderWidth: '1px',
          outline: 'none',
        }),
      }}
      {...resProps}
    />
  );
}

export default FormikTextarea;
