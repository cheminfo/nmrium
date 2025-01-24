import styled from '@emotion/styled';
import type { HTMLAttributes } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

interface AssignmentTableCellProps {
  hideRemoveAssignmentButton?: boolean;
}

const AssignmentTableCell = styled.td<AssignmentTableCellProps>`
  sup {
    visibility: hidden;
  }

  &:hover {
    sup {
      visibility: ${({ hideRemoveAssignmentButton }) =>
        hideRemoveAssignmentButton ? 'hidden' : 'visible'};
    }
  }
`;

interface AssignmentsCellProps
  extends HTMLAttributes<HTMLTableCellElement>,
    AssignmentTableCellProps {
  onRemove?: HTMLAttributes<HTMLButtonElement>['onClick'];
}

export function AssignmentsCell(props: AssignmentsCellProps) {
  const { onRemove, children, ...otherProps } = props;
  return (
    <AssignmentTableCell {...otherProps}>
      {children}
      <sup>
        <button
          type="button"
          style={{
            padding: 0,
            margin: 0,
          }}
          onClick={onRemove}
        >
          <FaMinusCircle color="red" />
        </button>
      </sup>
    </AssignmentTableCell>
  );
}
