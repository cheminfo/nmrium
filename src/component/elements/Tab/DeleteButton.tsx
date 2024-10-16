/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { CSSProperties } from 'react';
import { FaTimes } from 'react-icons/fa';

const styles = css`
  border-radius: 50%;
  width: 16px;
  height: 16px;
  background-color: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon {
    color: #252525;
    width: 8px;
  }

  :hover {
    background-color: red;
    border-radius: 50%;

    .icon {
      color: white;
    }
  }
`;

interface DeleteButtonProps {
  onDelete: (element: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: CSSProperties;
}

function DeleteButton({
  onDelete,
  className = 'delete',
  style = {},
}: DeleteButtonProps) {
  return (
    <button
      css={styles}
      className={className}
      style={style}
      type="button"
      onClick={onDelete}
    >
      <FaTimes className="icon" />
    </button>
  );
}

export default DeleteButton;
