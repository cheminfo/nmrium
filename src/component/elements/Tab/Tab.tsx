/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, ReactNode, useCallback } from 'react';

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

export interface InternalTabProps {
  tabid: string;
  tablabel: string;
  isActive: boolean;
  tabstyles?: CSSProperties;
  canDelete?: boolean;
  onDelete?: (element: any) => void;
  onClick?: (element: any) => void;
  render?: ({
    isActive,
    title,
    id,
  }: {
    isActive: boolean;
    title: string;
    id: string | number;
  }) => any;
}

export interface TabProps {
  tabid: string;
  tablabel: string;
  canDelete?: boolean;
  onDelete?: (element: any) => void;
  tabstyles?: CSSProperties;
  children: ReactNode;
}

export function InternalTab({
  tabid,
  tablabel,
  isActive,
  onClick = () => null,
  canDelete,
  onDelete = () => null,
  tabstyles,
  render,
}: InternalTabProps) {
  let className = 'tab-list-item';

  // use tab identifier if given (higher priority)
  if (isActive) {
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
      {canDelete && <DeleteButton onDelete={deleteHandler} />}
      {render ? render({ isActive, title: tablabel, id: tabid }) : tablabel}
    </li>
  );
}

export default function Tab(props: TabProps) {
  return <>{props.children}</>;
}
