import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import { FaTimes } from 'react-icons/fa';

const BaseButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  height: 16px;
  justify-content: center;
  padding: 0;
  width: 16px;

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
    <BaseButton
      className={className}
      style={style}
      type="button"
      onClick={onDelete}
    >
      <FaTimes className="icon" />
    </BaseButton>
  );
}

export default DeleteButton;
