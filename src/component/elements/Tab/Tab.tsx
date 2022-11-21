/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { CSSProperties, ReactNode } from 'react';

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


export interface TabEvents {
  onDelete?: (tab: Required<BaseTab>) => void;
  onClick?: (tab: Required<BaseTab>) => void;
}


export interface BaseTab {
  tabid: string;
  title?: string;
}
export interface BasicTabProps extends BaseTab {
  isActive?: boolean;
}
export interface TabProps extends BasicTabProps, TabEvents {
  tabstyles?: CSSProperties | SerializedStyles;
  canDelete?: boolean;
  render?: (options: Required<BasicTabProps>) => any;
  className?: string;
  children: ReactNode
}


export default function Tab({
  tabid,
  title,
  isActive,
  onClick = () => null,
  canDelete,
  onDelete = () => null,
  tabstyles,
  render,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children
}: TabProps) {

  const classNames = ['tab-list-item'];

  // use tab identifier if given (higher priority)
  if (isActive) {
    classNames.push('tab-list-active');
  }

  function clickHandler(e) {
    onClick({ ...e, title, tabid });
  }

  function deleteHandler(e) {
    // stop propagation here to not have set it
    // as active tab too (via tab click event triggering)
    e.stopPropagation();
    onDelete({ ...e, title, tabid });
  }

  return (
    <li className={`${classNames.join(" ")} ${className || ''}`} onClick={clickHandler} css={styles(tabstyles)} >
      {canDelete && <DeleteButton onDelete={deleteHandler} />}
      {
        render
          ? render({ isActive: isActive || false, title: title || '', tabid })
          : title
      }
    </li >
  );
}
