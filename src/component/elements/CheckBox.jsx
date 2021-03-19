import { useState, useCallback, forwardRef } from 'react';

const CheckBox = forwardRef(function CheckBox(
  { name = '', checked: checkProps, onChange = () => null, disabled },
  ref,
) {
  const [checked, setCheck] = useState(checkProps);

  const handleCheck = useCallback(
    (e) => {
      const _checked = !checked;
      setCheck(_checked);
      onChange(e);
    },
    [checked, onChange],
  );

  return (
    <input
      ref={ref}
      type="checkbox"
      name={name}
      id={name}
      onChange={handleCheck}
      defaultChecked={checkProps}
      disabled={disabled}
    />
  );
});

CheckBox.defaultProps = {
  onChange: function () {
    return null;
  },
  name: '',
  disabled: false,
};

export default CheckBox;
