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
  onValueReady,
  index,
}) => {
  const [active, setActive] = useState(isActive);
  const toggleButton = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const _isActive = !active;
      setActive(_isActive);
      if (_isActive) {
        onChange(value);
      }
    },
    [active, onChange, value],
  );

  useEffect(() => {
    if (value) {
      onValueReady({ value, index });
    }
  }, [index, onValueReady, value]);

  useEffect(() => {
    setActive(isActive);
  }, [isActive]);

  return (
    <button
      type="button"
      onClick={toggleButton}
      style={active ? { ...styles.button, ...styles.active } : styles.button}
      className={active ? 'button active' : 'button'}
      disabled={disabled}
    >
      {React.cloneElement(children, { style: { fontSize: '10px' } })}
    </button>
  );
};

ToggleButton.defaultProps = {
  isActive: false,
  disabled: false,
  value: null,
  onChange: function() {
    return null;
  },
  onValueReady: function() {
    return null;
  },
};

export default ToggleButton;
