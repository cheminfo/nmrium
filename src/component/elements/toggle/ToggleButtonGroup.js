import React, { useCallback, useState, useMemo } from 'react';

const style = { display: 'flex', flexDirection: 'column' };

const ToggleButtonGroup = ({ children, value, onChange }) => {
  const [toggleButtons, setToggleButtons] = useState([]);

  const handleOnChange = useCallback(
    (val) => {
      const _toggles = [...toggleButtons];
      const toggles = _toggles.map((toggle) => {
        return {
          value: toggle.value,
          isActive: toggle.value === val ? true : false,
        };
      });

      setToggleButtons(toggles);
      onChange(val);
    },
    [onChange, toggleButtons],
  );

  const handleOnValueReady = useCallback(
    (val) => {
      console.log('handleOnValueReady');
      toggleButtons[val.index] = {
        value: val.value,
        isActive: val.value === value ? true : false,
      };
    },
    [toggleButtons, value],
  );

  const Children = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      return React.cloneElement(child, {
        onChange: handleOnChange,
        isActive:
          toggleButtons[index] &&
          toggleButtons[index].isActive &&
          toggleButtons[index].isActive,
        onValueReady: handleOnValueReady,
        index,
      });
    });
  }, [children, handleOnChange, handleOnValueReady, toggleButtons]);
  return <div style={style}> {Children} </div>;
};

ToggleButtonGroup.defaultProps = {
  onChange: function() {
    return null;
  },
};
export default ToggleButtonGroup;
