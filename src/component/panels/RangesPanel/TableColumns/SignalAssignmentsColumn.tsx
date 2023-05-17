/** @jsxImportSource @emotion/react */

import lodashGet from 'lodash/get';
import { CSSProperties, memo, MouseEvent } from 'react';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';
import {
  RemoveAssignmentsButton,
  removeAssignmentCssStyle,
} from '../../../elements/RemoveAssignmentsButton';
import { OnHoverEvent, BaseRangeColumnProps } from '../RangesTableRow';

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
