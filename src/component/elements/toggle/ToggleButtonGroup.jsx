import {
  useCallback,
  useState,
  useMemo,
  useEffect,
  Children,
  cloneElement,
} from 'react';

import ToggleButton from './ToggleButton';

const style = { display: 'flex', flexDirection: 'column' };

function ToggleButtonGroup({ children, value, onChange }) {
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

  const mappedChildren = useMemo(() => {
    let index = 0;
    return Children.map(children, (child) => {
      if (child) {
        if (child.type === ToggleButton) {
          const _child = cloneElement(child, {
            onChange: handleOnChange,
            isActive:
              toggleButtons[index] &&
              toggleButtons[index].isActive &&
              toggleButtons[index].isActive,
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
    const val = Children.map(children, (child) => {
      if (child && child.type === ToggleButton) {
        return {
          value: child.props.value,
          isActive: child.props.value === value ? true : false,
        };
      }
    });
    setToggleButtons(val);
  }, [children, value]);

  return <div style={style}> {mappedChildren} </div>;
}

ToggleButtonGroup.defaultProps = {
  onChange: function () {
    return null;
  },
};
export default ToggleButtonGroup;
