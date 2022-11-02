/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useLayoutEffect, useRef } from 'react';

import { DropDownListProps } from './DropDownButton';

const styles = {
  container: css`
    background-color: white;
    position: absolute;
    height: auto;
    z-index: 99999999999999;
    box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
    border-radius: 10px;
    margin-bottom: 20px;
    overflow: hidden;
  `,
  ul: css`
    list-style-type: none;
    padding: 0;
    margin: 0;
  `,
  li: css`
    text-align: center;
    white-space: nowrap;
    color: black;
    border-bottom: 0.55px solid #f9f9f9;
    &:last-of-type {
      border-bottom: none;
    }

    &:hover {
      background-color: gray;
      color: white;
    }
  `,
  label: css`
    padding: 5px 20px;
    display: block;
  `,
};

function DropDownList({
  data = [],
  onSelect,
  renderItem = null,
}: DropDownListProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      const containerRect = ref.current?.getBoundingClientRect();
      if (containerRect.right > window.innerWidth) {
        ref.current.style.right = `${
          containerRect.right - window.innerWidth
        }px`;
      }
    }
  }, []);
  return (
    <div css={styles.container} ref={ref}>
      <ul css={styles.ul}>
        {data.map((item, index) => (
          <li css={styles.li} key={item.key} onClick={() => onSelect(index)}>
            {renderItem?.(item) || <span css={styles.label}>{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DropDownList;
