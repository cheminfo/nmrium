/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  useCallback,
  useState,
  useEffect,
  cloneElement,
  CSSProperties,
  ReactElement,
  JSXElementConstructor,
} from 'react';

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

interface ToggleButtonProps {
  isActive?: boolean;
  disabled?: boolean;
  isVisible?: boolean;
  className?: string;
  value?: any;
  onChange?: (value: any) => null;

  children: ReactElement<any, string | JSXElementConstructor<any>>;
  style?: CSSProperties;
  onMouseEnter?: (element: any) => void;
  onMouseLeave?: () => void;
  helpID?: string;
}

function ToggleButton({
  children,
  value = null,
  disabled = false,
  isActive = false,
  onChange = () => null,
  className = '',
  style = {},
  isVisible = true,
  onMouseEnter,
  onMouseLeave,
  helpID,
}: ToggleButtonProps) {
  const [active, setActive] = useState(isActive);
  const toggleButton = useCallback(() => {
    const _isActive = !active;
    setActive(_isActive);
    if (_isActive) {
      onChange(value);
    } else {
      onChange(null);
    }
  }, [active, onChange, value]);

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
      data-test-id={`tool-${value}`}
    >
      {cloneElement(children, { style: { fontSize: '10px' } })}
    </button>
  );
}

export default ToggleButton;
