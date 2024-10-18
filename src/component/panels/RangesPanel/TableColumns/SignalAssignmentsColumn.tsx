/** @jsxImportSource @emotion/react */

import lodashGet from 'lodash/get.js';
import type { CSSProperties, MouseEvent } from 'react';
import { memo } from 'react';

import type { AssignmentsData } from '../../../assignment/AssignmentsContext.js';
import {
  removeAssignmentCssStyle,
  RemoveAssignmentsButton,
} from '../../../elements/RemoveAssignmentsButton.js';
import type { BaseRangeColumnProps, OnHoverEvent } from '../RangesTableRow.js';

interface SignalAssignmentsColumnProps
  extends Omit<BaseRangeColumnProps, 'format'>,
    OnHoverEvent {
  assignment: AssignmentsData;
  highlight: {
    isActive: boolean;
  };
  onLink?: (a: MouseEvent, b: AssignmentsData) => void;
  onUnlink?: (element: MouseEvent, b: boolean) => void;
}

function SignalAssignmentsColumn({
  row,
  onHover,
  assignment,
  highlight,
  onLink,
  onUnlink,
}: SignalAssignmentsColumnProps) {
  const diaIDs = lodashGet(row, 'tableMetaInfo.signal.diaIDs', []);

  const tdCss: CSSProperties =
    assignment.isActive || highlight.isActive
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : {};

  function assignHandler(e: MouseEvent) {
    onLink?.(e, assignment);
  }

  return (
    <td
      {...onHover}
      onClick={assignHandler}
      style={{ padding: '0', ...tdCss }}
      css={!assignment.isActive && removeAssignmentCssStyle}
    >
      {(diaIDs?.length > 0 || assignment.isActive) && (
        <>
          <span>{diaIDs?.length || 0}</span>
          <RemoveAssignmentsButton onClick={(e) => onUnlink?.(e, false)} />
        </>
      )}
    </td>
  );
}

export default memo(SignalAssignmentsColumn);
