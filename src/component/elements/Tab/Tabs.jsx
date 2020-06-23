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
import { positions } from './options';

const topStyles = css`
  height: 100%;
  width: 100%;
  .tab-list {
    border-bottom: 1px solid #ccc;
    padding-left: 0;
    margin: 0;
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

const leftStyles = css`
  display: flex;
  height: 100%;
  width: 100%;
  .tab-list {
    border-right: 1px solid #ccc;
    padding-left: 0;
    margin: 0;
  }

  .tab-list li:hover {
    background-color: #f7f7f7;
  }

  .tab-list li:first-of-type {
    margin-top: 10px;
  }

  .tab-list-item {
    display: block;
    list-style: none;
    margin-right: -1px;
    padding: 0.5rem 0.75rem;
  }

  .tab-list-active {
    background-color: white;
    border: solid #ccc;
    border-width: 1px 0px 1px 1px;
  }
`;

const Tabs = ({ children, onClick, defaultTabID, position }) => {
  const [activeTab, setActiveTab] = useState();

  useEffect(() => {
    setActiveTab(defaultTabID);
  }, [defaultTabID]);

  const onClickTabHandler = useCallback(
    (tab) => {
      const { label, id: identifier } = tab;
      onClick({ label, identifier });
      // use tab identifier if given (higher priority)
      setActiveTab(identifier !== undefined ? identifier : label);
    },
    [onClick],
  );

  const tabs = useMemo(() => {
    return Children.map(children, (child) => {
      const { label, identifier } = child.props;
      return (
        <Tab
          activeTab={activeTab}
          key={label}
          label={label}
          onClick={onClickTabHandler}
          id={identifier}
        />
      );
    });
  }, [activeTab, children, onClickTabHandler]);

  const tabsContent = useMemo(() => {
    return Children.map(children, (child) => {
      const { label, identifier } = child.props;
      // use tab identifier if given (higher priority)
      if (identifier !== undefined) {
        if (identifier !== activeTab) {
          return cloneElement(child, { style: { display: 'none' } });
        }
      } else if (label !== activeTab) {
        return cloneElement(child, { style: { display: 'none' } });
      }
      return cloneElement(child, { style: { display: 'block' } });
    });
  }, [activeTab, children]);

  const styles = useMemo(() => {
    switch (position) {
      case positions.TOP:
        return topStyles;
      case positions.LEFT:
        return leftStyles;
      default:
        return topStyles;
    }
  }, [position]);

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
  position: 'TOP',
};

Tabs.propTypes = {
  children: PropTypes.array.isRequired,
  onClick: PropTypes.func,
  position: PropTypes.oneOf(['TOP', 'LEFT']),
};

export default Tabs;
