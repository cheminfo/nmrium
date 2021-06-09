/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useMemo, Children, memo, ReactElement } from 'react';

import { InternalTab, TabProps } from './Tab';

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

export enum PositionsEnum {
  TOP = 'TOP',
  LEFT = 'LEFT',
}

interface TabsProps {
  children: Array<ReactElement<TabProps>>;
  onClick: (element: any) => void;
  activeTab: string;
  position: PositionsEnum;
  onDelete?: (element: any) => void;
}

function Tabs({
  children,
  onClick,
  position,
  onDelete = () => null,
  activeTab,
}: TabsProps) {
  const onClickTabHandler = useCallback(
    (tab) => {
      const { tablabel, tabid } = tab;
      onClick({ tablabel, tabid });
    },
    [onClick],
  );

  let contentChild;
  const tabs = Children.map(children, (child) => {
    const { tabid } = child.props;

    if (tabid === activeTab) {
      contentChild = child.props.children;
    }

    return (
      <InternalTab
        {...child.props}
        isActive={tabid === activeTab}
        onClick={onClickTabHandler}
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
