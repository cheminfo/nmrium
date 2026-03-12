import styled from '@emotion/styled';
import type { AxisUnit } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';
import { assert } from 'react-science/ui';

import type { ContextMenuItem } from '../../elements/ContextMenuBluePrint.tsx';
import { ContextMenu } from '../../elements/ContextMenuBluePrint.tsx';
import useCheckExperimentalFeature from '../../hooks/useCheckExperimentalFeature.ts';
import { axisUnitToLabel } from '../../hooks/use_axis_unit.ts';

interface AxisUnitPickerProps {
  unit: AxisUnit;
  allowedUnits: AxisUnit[];
  onChange: (unit: AxisUnit) => void;
  children: ReactNode;
}

export function AxisUnitPicker(props: AxisUnitPickerProps) {
  const { unit, allowedUnits, onChange, children } = props;
  const isExperimental = useCheckExperimentalFeature();

  if (!isExperimental) return children;

  const options: ContextMenuItem[] = allowedUnits.map((allowedUnit) => ({
    key: allowedUnit,
    roleStructure: 'listoption',
    text: axisUnitToLabel[allowedUnit],
    selected: allowedUnit === unit,
    data: { unit: allowedUnit } as Data,
  }));

  function onSelect(data?: object) {
    assert(data);
    const { unit } = data as Data;
    onChange(unit);
  }

  return (
    <ContextMenuStyled
      as="g"
      className="unit"
      options={options}
      onSelect={onSelect}
    >
      {children}
    </ContextMenuStyled>
  );
}

const ContextMenuStyled = styled(ContextMenu)`
  pointer-events: auto;
  cursor: context-menu;
`;

interface Data {
  unit: AxisUnit;
}
