/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import DeleteButton from './DeleteButton';

const styles = (styles) => css`
  position: relative;

  .delete {
    position: absolute;
    top: 2px;
    left: 2px;
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
        <DeleteButton onDelete={deleteHandler} />
        // <button className="delete" type="button" onClick={deleteHandler}>
        //   <FaTimes className="icon" />
        // </button>
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
