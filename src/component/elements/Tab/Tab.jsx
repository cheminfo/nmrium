import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

const Tab = ({ label, activeTab, onClick }) => {
  let className = 'tab-list-item';

  if (activeTab === label) {
    className += ' tab-list-active';
  }

  const onClickHandler = useCallback(
    (e) => {
      onClick({ ...e, label });
    },
    [label, onClick],
  );
  return (
    <li className={className} onClick={onClickHandler}>
      {label}
    </li>
  );
};

Tab.propTypes = {
  activeTab: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Tab;
