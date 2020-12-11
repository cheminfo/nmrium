/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState, useEffect, cloneElement } from 'react';

const styles = css`
  width: 35px;
  height: 35px;
  background-color: white;
  padding: 5px;
  margin: 0px;
  border: none;
  outline: none;

  :focus {
    outline: none !important;
  }
`;
const activeStyles = css`
  color: black;
  background-color: #f3f3f3 !important;
`;

const ToggleButton = ({
  children,
  value,
  disabled,
  isActive,
  onChange,
  className,
  style,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  helpID,
}) => {
  const [active, setActive] = useState(isActive);
  const toggleButton = useCallback(
    (e) => {
      // e.preventDefault();
      // e.stopPropagation();
      const _isActive = !active;
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
      css={[styles, active && activeStyles]}
      style={style}
      className={active ? ` ${className}  active` : ` ${className} `}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-helpid={helpID}
    >
      {cloneElement(children, { style: { fontSize: '10px' } })}
    </button>
  );
};
ToggleButton.displayName = 'ToggleButton';

ToggleButton.defaultProps = {
  isActive: false,
  disabled: false,
  isVisible: true,
  value: null,
  className: '',
  onChange: function () {
    return null;
  },
  onValueReady: function () {
    return null;
  },
};

export default ToggleButton;
