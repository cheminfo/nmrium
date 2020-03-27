/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  Children,
  cloneElement,
} from 'react';

import Tab from './Tab';

const styles = css`
  .tab-list {
    border-bottom: 1px solid #ccc;
    padding-left: 0;
  }

  .tab-list li:first-of-type {
    margin-left: 5px;
  }

  .tab-list li:hover {
    background-color: #f7f7f7;
  }

  .tab-list-item {
    display: inline-block;
    list-style: none;
    margin-bottom: -1px;
    padding: 0.5rem 0.75rem;
  }

  .tab-list-active {
    background-color: white;
    border: solid #ccc;
    border-width: 1px 1px 0 1px;
  }
`;

const Tabs = ({ children, onClick, defaultTabID }) => {
  const [activeTab, setActiveTab] = useState();

  useEffect(() => {
    setActiveTab(defaultTabID);
  }, [defaultTabID]);

  const onClickTabHandler = useCallback(
    (tab) => {
      onClick(tab.label);
      setActiveTab(tab.label);
    },
    [onClick],
  );

  const tabs = useMemo(() => {
    return Children.map(children, (child) => {
      const { label } = child.props;
      return (
        <Tab
          activeTab={activeTab}
          key={label}
          label={label}
          onClick={onClickTabHandler}
        />
      );
    });
  }, [activeTab, children, onClickTabHandler]);

  const tabsContent = useMemo(() => {
    return Children.map(children, (child) => {
      if (child.props.label !== activeTab) {
        return cloneElement(child, { style: { display: 'none' } });
      }
      return cloneElement(child, { style: { display: 'block' } });
    });
  }, [activeTab, children]);

  return (
    <div className="tabs" css={styles}>
      <ol className="tab-list">{tabs}</ol>
      <div className="tab-content">{tabsContent}</div>
    </div>
  );
};

Tabs.defaultProps = {
  onClick: () => {
    return null;
  },
};

Tabs.propTypes = {
  children: PropTypes.instanceOf(Array).isRequired,
  onClick: PropTypes.func,
};

export default Tabs;
