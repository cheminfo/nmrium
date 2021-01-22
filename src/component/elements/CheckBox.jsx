import { useState, useCallback, forwardRef } from 'react';

function CheckBox({ name, checked: checkProps, onChange }, ref) {
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
    />
  );
}

CheckBox.defaultProps = {
  onChange: function () {
    return null;
  },
  name: '',
};

export default forwardRef(CheckBox);
