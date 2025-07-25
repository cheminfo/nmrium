/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { ReactElement } from 'react';
import { Children, isValidElement, memo, useMemo } from 'react';

import type { TabEvents, TabProps } from './Tab.js';
import Tab from './Tab.js';

const topStyles = css`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .tab-list {
    border-bottom: 1px solid #ccc;
    padding-left: 0;
    margin: 0;
    display: inline-flex;
  }

  .tab-list li:first-of-type {
    margin-left: 5px;
  }

  .tab-list li:hover {
    background-color: #f7f7f7;
  }

  .tab-list-item {
    display: inline-flex;
    list-style: none;
    padding: 0.5rem 2rem;
  }

  .tab-list-active {
    background-color: white;
    border: solid #ccc;
    border-width: 1px 1px 0;
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
    white-space: nowrap;
  }

  .tab-list-active {
    background-color: white;
    border: solid #ccc;
    border-width: 1px 0 1px 1px;
  }

  .tab-content {
    height: 100%;
    overflow: auto;
  }
`;

enum PositionsEnum {
  TOP = 'TOP',
  LEFT = 'LEFT',
}

interface TabsProps extends TabEvents {
  children: Array<ReactElement<TabProps> | boolean>;
  activeTab: string;
  position?: PositionsEnum;
}

function Tabs({
  children,
  onClick,
  position,
  onDelete = () => null,
  activeTab,
}: TabsProps) {
  function handleClickTab(tab) {
    const { title, tabid } = tab;
    onClick?.({ title, tabid });
  }

  let contentChild;
  const tabs = Children.map(children, (child) => {
    if (!isValidElement(child)) return null;

    const { tabid } = child.props;

    if (tabid === activeTab) {
      // TODO: avoid this by not implementing a custom tabs component.
      // eslint-disable-next-line react-hooks/react-compiler
      contentChild = child.props.children;
    }

    return (
      <Tab
        {...child.props}
        isActive={tabid === activeTab}
        onClick={handleClickTab}
        onDelete={onDelete}
      />
    );
  });

  const styles = useMemo(() => {
    switch (position) {
      case PositionsEnum.TOP:
        return topStyles;
      case PositionsEnum.LEFT:
        return leftStyles;
      default:
        return topStyles;
    }
  }, [position]);

  return (
    <div className="tabs" css={styles}>
      <ol className="tab-list">{tabs}</ol>
      <div className="tab-content">{contentChild}</div>
    </div>
  );
}

export default memo(Tabs);
