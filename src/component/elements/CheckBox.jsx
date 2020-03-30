import React, { useState, useCallback } from 'react';

const CheckBox = ({ checked: checkProps, onChange }) => {
  const [checked, setCheck] = useState(checkProps);

  const handleCheck = useCallback(() => {
    const _checked = !checked;
    setCheck(_checked);
    onChange(_checked);
  }, [checked, onChange]);

  return (
    <input type="checkbox" onChange={handleCheck} defaultChecked={checked} />
  );
};

CheckBox.defaultProps = {
  onChange: function () {
    return null;
  },
};

export default CheckBox;
