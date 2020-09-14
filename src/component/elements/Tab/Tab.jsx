/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

const styles = (styles) => css`
  position: relative;

  .delete {
    position: absolute;
    border-radius: 50%;
    width: 17px;
    height: 17px;
    background-color: transparent;
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

  ${styles}
`;

const Tab = ({
  tabid,
  tablabel,
  activeTab,
  onClick,
  canDelete,
  onDelete,
  tabstyles,
}) => {
  let className = 'tab-list-item';

  // use tab identifier if given (higher priority)
  if (activeTab === tabid) {
    className += ' tab-list-active';
  }

  const clickHandler = useCallback(
    (e) => {
      onClick({ ...e, tablabel, tabid });
    },
    [onClick, tablabel, tabid],
  );
  const deleteHandler = useCallback(
    (e) => {
      // stop propagation here to not have set it
      // as active tab too (via tab click event triggering)
      e.stopPropagation();
      onDelete({ ...e, tablabel, tabid });
    },
    [onDelete, tablabel, tabid],
  );
  return (
    <li className={className} onClick={clickHandler} css={styles(tabstyles)}>
      {canDelete && (
        <button className="delete" type="button" onClick={deleteHandler}>
          <FaTimes className="icon" />
        </button>
      )}
      {tablabel}
    </li>
  );
};

Tab.propTypes = {
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tablabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  tabid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  canDelete: PropTypes.bool,
};

export default Tab;
