import React, { useCallback, useState, useEffect } from 'react';

const styles = {
  button: {
    width: '35px',
    height: '35px',
    backgroundColor: 'white',
    padding: '5px',
    margin: '0px',
    border: 'none',
  },
  active: {
    color: 'black',
    backgroundColor: '#f3f3f3',
  },
};

const ToggleButton = ({
  children,
  value,
  disabled,
  isActive,
  onChange,
  className,
  style,
  isVisible,
}) => {
  const [active, setActive] = useState(isActive);
  const toggleButton = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const _isActive = !active;
      // isActive === false || isActive === undefined ? !active : active;
      setActive(_isActive);
      if (_isActive) {
        onChange(value);
      } else {
        onChange(null);
      }
    },
    [active, onChange, value],
  );

  useEffect(() => {
    setActive(isActive);
  }, [isActive]);

  if (!isVisible) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={toggleButton}
      style={
        active
          ? { ...styles.button, ...styles.active, ...style }
          : { ...styles.button, ...style }
      }
      className={
        active ? ` ${className} button active` : ` ${className} button`
      }
      disabled={disabled}
    >
      {React.cloneElement(children, { style: { fontSize: '10px' } })}
    </button>
  );
};

ToggleButton.defaultProps = {
  isActive: false,
  disabled: false,
  isVisible: true,
  value: null,
  onChange: function() {
    return null;
  },
  onValueReady: function() {
    return null;
  },
};

export default ToggleButton;
