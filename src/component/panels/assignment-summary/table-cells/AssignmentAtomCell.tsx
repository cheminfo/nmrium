import { Button } from '@blueprintjs/core';
import styled from '@emotion/styled';

import type { AssignmentListRow } from '../utilities/atomGroupsToAssignmentRows.js';

interface AssignmentAtomCellProps {
  row: AssignmentListRow;
  onToggle: (id: string) => void;
}

const AtomCellContainer = styled.span`
  display: flex;
  align-items: center;
`;

export function AssignmentAtomCell({ row, onToggle }: AssignmentAtomCellProps) {
  return (
    <AtomCellContainer>
      <Button
        variant="minimal"
        size="small"
        icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
        style={{
          visibility: row.hasChildren ? 'visible' : 'hidden',
        }}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(row.id);
        }}
      />
      <span style={{ paddingInlineStart: row.isHydrogen ? '0.5em' : 0 }}>
        {row.atomLabel}
      </span>
    </AtomCellContainer>
  );
}
