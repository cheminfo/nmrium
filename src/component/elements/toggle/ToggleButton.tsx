import { Toolbar } from 'analysis-ui-components';
import {
  useCallback,
  useState,
  useEffect,
  ReactElement,
  JSXElementConstructor,
} from 'react';

interface ToggleButtonProps {
  isActive?: boolean;
  value?: any;
  onChange?: (value: any) => null;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
  isVisible?: boolean;
}

export default function ToggleButton(
  props: ToggleButtonProps & { title: string; id: string },
) {
  const {
    children,
    value = null,
    isActive = false,
    onChange = () => null,
    isVisible = true,
    id,
    title,
  } = props;

  const [active, setActive] = useState(props.isActive);

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
    <Toolbar.Item onClick={toggleButton} title={title} id={id} active={active}>
      {children}
    </Toolbar.Item>
  );
}
