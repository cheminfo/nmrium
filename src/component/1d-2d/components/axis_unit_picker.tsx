import type { ContextMenuChildrenProps } from '@blueprintjs/core';
import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core';
import type { AxisUnit } from '@zakodium/nmrium-core';
import type { ReactElement } from 'react';

import { axisUnitToLabel } from '../../hooks/use_axis_unit.ts';

interface AxisUnitPickerProps {
  unit: AxisUnit;
  allowedUnits: AxisUnit[];
  onChange: (unit: AxisUnit) => void;
  children: (props: ContextMenuChildrenProps) => ReactElement;
}

export function AxisUnitPicker(props: AxisUnitPickerProps) {
  const { children, unit, allowedUnits, onChange } = props;

  return (
    <ContextMenu
      content={
        <Menu>
          {allowedUnits.map((allowedUnit) => (
            <MenuItem
              key={allowedUnit}
              roleStructure="listitem"
              text={axisUnitToLabel[allowedUnit]}
              selected={allowedUnit === unit}
              onClick={() => onChange(allowedUnit)}
            />
          ))}
        </Menu>
      }
    >
      {(props) => children(props)}
    </ContextMenu>
  );
}
