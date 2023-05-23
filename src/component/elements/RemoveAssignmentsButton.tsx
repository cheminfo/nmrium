/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaMinusCircle } from 'react-icons/fa';

export const removeAssignmentCssStyle = css`
  .remove-assignment {
    visibility: hidden;
  }

  &:hover {
    .remove-assignment {
      visibility: visible;
    }
  }
`;

export function RemoveAssignmentsButton({ onClick }) {
  return (
    <sup className="remove-assignment">
      <button
        type="button"
        style={{
          padding: 0,
          margin: 0,
        }}
        onClick={onClick}
      >
        <FaMinusCircle color="red" />
      </button>
    </sup>
  );
}
