import type { AxisUnit } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';

import type { ContextMenuItem } from '../../elements/ContextMenuBluePrint.tsx';
import { ContextMenu } from '../../elements/ContextMenuBluePrint.tsx';
import { axisUnitToLabel } from '../../hooks/use_axis_unit.ts';

interface AxisUnitPickerProps {
  unit: AxisUnit;
  allowedUnits: AxisUnit[];
  onChange: (unit: AxisUnit) => void;
  children: ReactNode;
}

export function AxisUnitPicker(props: AxisUnitPickerProps) {
  const { unit, allowedUnits, onChange, children } = props;

  const options: ContextMenuItem[] = allowedUnits.map((allowedUnit) => ({
    key: allowedUnit,
    roleStructure: 'listoption',
    text: axisUnitToLabel[allowedUnit],
    selected: allowedUnit === unit,
    data: { unit: allowedUnit } as Data,
  }));

  return (
    <ContextMenu
      as="g"
      className="unit"
      options={options}
      onSelect={({ unit }: Data) => onChange(unit)}
      style={{ pointerEvents: 'auto' }}
    >
      {children}
    </ContextMenu>
  );
}

interface Data {
  unit: AxisUnit;
}
