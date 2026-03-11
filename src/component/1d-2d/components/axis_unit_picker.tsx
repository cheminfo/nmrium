import type { AxisUnit } from '@zakodium/nmrium-core';
import type { ComponentProps } from 'react';

import type { ContextMenuItem } from '../../elements/ContextMenuBluePrint.tsx';
import { ContextMenu } from '../../elements/ContextMenuBluePrint.tsx';
import { axisUnitToLabel } from '../../hooks/use_axis_unit.ts';

interface AxisUnitPickerProps extends Omit<
  ComponentProps<typeof ContextMenu<'text'>>,
  'onChange' | 'options' | 'onSelect' | 'children'
> {
  unit: AxisUnit;
  allowedUnits: AxisUnit[];
  onChange: (unit: AxisUnit) => void;
}

export function AxisUnitPicker(props: AxisUnitPickerProps) {
  const { unit, allowedUnits, onChange, ...contextMenuProps } = props;

  const options: ContextMenuItem[] = allowedUnits.map((allowedUnit) => ({
    key: allowedUnit,
    roleStructure: 'listoption',
    text: axisUnitToLabel[allowedUnit],
    selected: allowedUnit === unit,
    data: { unit: allowedUnit } as Data,
  }));
  const label = axisUnitToLabel[unit];

  return (
    <ContextMenu
      as="text"
      {...contextMenuProps}
      options={options}
      onSelect={({ unit }: Data) => onChange(unit)}
      style={{ pointerEvents: 'auto', ...contextMenuProps.style }}
    >
      {label}
    </ContextMenu>
  );
}

interface Data {
  unit: AxisUnit;
}
