import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const Tab = ({ id, label, activeTab, onClick }) => {
  let className = 'tab-list-item';

  // use tab identifier if given (higher priority)
  if (id !== undefined) {
    if (activeTab === id) {
      className += ' tab-list-active';
    }
  } else if (activeTab === label) {
    className += ' tab-list-active';
  }

  const onClickHandler = useCallback(
    (e) => {
      onClick({ ...e, label, id });
    },
    [label, onClick, id],
  );
  return (
    <li className={className} onClick={onClickHandler}>
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
