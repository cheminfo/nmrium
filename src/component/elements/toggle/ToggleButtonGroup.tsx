import {
  useCallback,
  useState,
  useMemo,
  useEffect,
  Children,
  cloneElement,
  ReactNode,
} from 'react';

import ToggleButton from './ToggleButton';

interface ToggleButtonGroupProps {
  children: ReactNode;
  value: string;
  onChange?: (value: any) => void;
}

export default function ToggleButtonGroup({
  children,
  value,
  onChange = () => null,
}: ToggleButtonGroupProps) {
  const [toggleButtons, setToggleButtons] = useState<any>([]);
  const handleOnChange = useCallback(
    (val) => {
      const _toggles: Array<any> = [...toggleButtons];
      const toggles = _toggles.map((toggle) => {
        return {
          value: toggle.value,
          isActive: toggle.value === val,
        };
      });

      setToggleButtons(toggles);
      onChange(val);
    },
    [onChange, toggleButtons],
  );

  const mappedChildren = useMemo(() => {
    let index = 0;
    return Children.map(children, (child: any) => {
      if (child) {
        if (child.type === ToggleButton) {
          const _child = cloneElement(child, {
            onChange: handleOnChange,
            isActive: toggleButtons[index]?.isActive,
            index,
          });
          index++;
          return _child;
        } else {
          return cloneElement(child);
        }
      }
    });
  }, [children, handleOnChange, toggleButtons]);

  useEffect(() => {
    const val = Children.map(children, (child: any) => {
      if (child && child.type === ToggleButton) {
        return {
          value: child.props.value,
          isActive: child.props.value === value,
        };
      }
    });
    setToggleButtons(val);
  }, [children, value]);

  return <>{mappedChildren}</>;
}
