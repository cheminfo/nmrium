/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

const styles = css`
  position: relative;

  .delete {
    position: absolute;
    border-radius: 50%;
    width: 17px;
    height: 17px;
    background-color: white;
    border: none;
    top: 2px;
    padding: 0;
    left: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete:hover {
    background-color: red;
    border-radius: 50%;
    width: 15px;
    height: 15px;

    .icon {
      color: white;
    }
  }

  .icon {
    color: #252525;
    width: 8px;
  }
`;

const Tab = ({ id, label, activeTab, onClick, canDelete, onDelete }) => {
  let className = 'tab-list-item';

  // use tab identifier if given (higher priority)
  if (id !== undefined) {
    if (activeTab === id) {
      className += ' tab-list-active';
    }
  } else if (activeTab === label) {
    className += ' tab-list-active';
  }

  const clickHandler = useCallback(
    (e) => {
      onClick({ ...e, label, id });
    },
    [label, onClick, id],
  );
  const deleteHandler = useCallback(
    (e) => {
      onDelete({ ...e, label, id });
    },
    [onDelete, label, id],
  );
  return (
    <li className={className} onClick={clickHandler} css={styles}>
      {canDelete && (
        <button className="delete" type="button" onClick={deleteHandler}>
          <FaTimes className="icon" />
        </button>
      )}
      {label}
    </li>
  );
};

Tab.propTypes = {
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  // tab identifier, if given, can be a string or number
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Tab;
