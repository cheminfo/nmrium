/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { KeyboardEvent, ReactElement } from 'react';
import { Children, isValidElement, memo, useId, useMemo } from 'react';

import type { TabEvents, TabProps } from './Tab.js';
import Tab from './Tab.js';

const topStyles = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .tab-list {
    border-bottom: 1px solid #ccc;
    display: inline-flex;
    margin: 0;
    padding-left: 0;
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
    margin: 0;
    padding-left: 0;
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

type TabPosition = 'TOP' | 'LEFT';

interface TabsProps extends TabEvents {
  children: Array<ReactElement<TabProps> | boolean>;
  activeTab: string;
  position?: TabPosition;
}

function Tabs({
  children,
  onClick,
  position,
  onDelete = () => null,
  activeTab,
}: TabsProps) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;

  function handleClickTab(tab: any) {
    const { title, tabid } = tab;
    onClick?.({ title, tabid });
  }

  const tabItems: Array<Required<Pick<TabProps, 'tabid' | 'title'>>> = [];
  let contentChild;
  let activeTabId: string | undefined;
  const tabs = Children.map(children, (child) => {
    if (!isValidElement(child)) return null;

    const { tabid, title = '' } = child.props;
    const id = `${baseId}-tab-${tabItems.length}`;
    tabItems.push({ tabid, title });

    if (tabid === activeTab) {
      contentChild = child.props.children;
      activeTabId = id;
    }

    return (
      <Tab
        {...child.props}
        id={id}
        panelId={panelId}
        isActive={tabid === activeTab}
        onClick={handleClickTab}
        onDelete={onDelete}
      />
    );
  });

  function handleKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    const isVertical = position === 'LEFT';
    const tabElements = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'),
    ];
    const currentIndex = tabElements.indexOf(event.target as HTMLElement);
    if (currentIndex === -1) return;

    const lastIndex = tabElements.length - 1;
    let nextIndex: number;
    switch (event.key) {
      case isVertical ? 'ArrowUp' : 'ArrowLeft':
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        break;
      case isVertical ? 'ArrowDown' : 'ArrowRight':
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    tabElements[nextIndex].focus();
    handleClickTab(tabItems[nextIndex]);
  }

  const styles = useMemo(() => {
    switch (position) {
      case 'TOP':
        return topStyles;
      case 'LEFT':
        return leftStyles;
      default:
        return topStyles;
    }
  }, [position]);

  return (
    <div className="tabs" css={styles}>
      <ol
        className="tab-list"
        role="tablist"
        aria-orientation={position === 'LEFT' ? 'vertical' : 'horizontal'}
        onKeyDown={handleKeyDown}
      >
        {tabs}
      </ol>
      {/* Keyed by tab so that switching tabs remounts the content. */}
      <div
        key={activeTab}
        id={panelId}
        className="tab-content"
        role="tabpanel"
        aria-labelledby={activeTabId}
      >
        {contentChild}
      </div>
    </div>
  );
}

export default memo(Tabs);
