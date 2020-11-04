import React, { useState, useCallback } from 'react';

const CheckBox = ({ name, checked: checkProps, onChange }) => {
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
      type="checkbox"
      name={name}
      id={name}
      onChange={handleCheck}
      defaultChecked={checkProps}
    />
  );
};

CheckBox.defaultProps = {
  onChange: function () {
    return null;
  },
  name: '',
};

export default CheckBox;
