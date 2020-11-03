/** @jsx jsx */
import { jsx, css } from '@emotion/core';
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

  :hover {
    background-color: red;
    border-radius: 50%;

    .icon {
      color: white;
    }
  }

  .icon {
    color: #252525;
    width: 8px;
  }
`;

const DeleteButton = ({ onDelete, className = 'delete' }) => {
  return (
    <button css={styles} className={className} type="button" onClick={onDelete}>
      <FaTimes className="icon" />
    </button>
  );
};

export default DeleteButton;
