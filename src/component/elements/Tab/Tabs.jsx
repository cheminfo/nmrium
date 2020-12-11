/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
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
  display: flex;
  flex-direction: column;

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
    padding: 0.5rem 2rem;
  }

  .tab-list-active {
    background-color: white;
    border: solid #ccc;
    border-width: 1px 1px 0 1px;
  }

  .tab-content {
    height: 100%;
    overflow: auto;
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

  .tab-content {
    height: 100%;
    overflow: auto;
  }
`;

const Tabs = ({
  children,
  onClick,
  defaultTabID,
  position,
  canDelete,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState();

  useEffect(() => {
    setActiveTab(defaultTabID);
  }, [defaultTabID]);

  const onClickTabHandler = useCallback(
    (tab) => {
      const { tablabel, tabid } = tab;
      onClick({ tablabel, tabid });
      // use tab identifier if given (higher priority)
      setActiveTab(tabid);
    },
    [onClick],
  );

  const tabs = useMemo(() => {
    return Children.map(children, (child) => {
      const { tablabel, tabid, candelete, tabstyles } = child.props;
      const deleteFlag = candelete
        ? candelete.toLowerCase() === 'true'
        : canDelete;
      return (
        <Tab
          activeTab={activeTab}
          key={tabid}
          tablabel={tablabel}
          onClick={onClickTabHandler}
          tabid={tabid}
          canDelete={deleteFlag}
          onDelete={onDelete}
          tabstyles={tabstyles}
        />
      );
    });
  }, [activeTab, canDelete, children, onClickTabHandler, onDelete]);

  const tabsContent = useMemo(() => {
    return Children.map(children, (child) => {
      const { tabid, style } = child.props;
      if (tabid !== activeTab) {
        return cloneElement(child, { style: { display: 'none' } });
      }
      return cloneElement(child, {
        style: { display: 'block', ...style },
      });
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
  onClick: () => null,
  onDelete: () => null,
  position: 'TOP',
  canDelete: false,
};

Tabs.propTypes = {
  children: PropTypes.array.isRequired,
  onClick: PropTypes.func,
  position: PropTypes.oneOf(['TOP', 'LEFT']),
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default Tabs;
