import React, { useCallback, useState, useMemo, useEffect } from 'react';

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

  const Children = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      return (
        child &&
        React.cloneElement(child, {
          onChange: handleOnChange,
          isActive:
            toggleButtons[index] &&
            toggleButtons[index].isActive &&
            toggleButtons[index].isActive,
          index,
        })
      );
    });
  }, [children, handleOnChange, toggleButtons]);

  useEffect(() => {
    const val = React.Children.map(children, (child) => {
      if (child) {
        return {
          value: child.props.value,
          isActive: child.props.value === value ? true : false,
        };
      }
    });
    setToggleButtons(val);
  }, [children, value]);

  return <div style={style}> {Children} </div>;
};

ToggleButtonGroup.defaultProps = {
  onChange: function() {
    return null;
  },
};
export default ToggleButtonGroup;
