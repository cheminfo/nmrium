/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useLayoutEffect, useRef } from 'react';

import {
  DropDownListItem,
  DropDownListProps,
  ItemProps,
} from './DropDownButton';

const styles = {
  container: css`
    background-color: white;
    position: absolute;
    height: auto;
    z-index: 99999999999999;
    box-shadow:
      0 19px 38px rgb(0 0 0 / 30%),
      0 15px 12px rgb(0 0 0 / 22%);
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

interface InnerDropDownListProps<T>
  extends DropDownListProps<T>,
    Required<ItemProps> {
  onSelect: (index: number) => void;
}

function DropDownList({
  data = [],
  onSelect,
  renderItem = null,
  itemKey,
  labelKey,
  visibleKey,
}: InnerDropDownListProps<DropDownListItem>) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (container) {
      const { right } = container.getBoundingClientRect();
      const innerWidth = window.innerWidth - 30;
      if (right > innerWidth) {
        container.style.left = `-${right - innerWidth}px`;
      }
    }

    return () => {
      if (container) {
        container.style.left = '0px';
      }
    };
  }, []);

  return (
    <div css={styles.container} ref={ref}>
      <ul css={styles.ul}>
        {data.map((item, index) => (
          <li
            css={styles.li}
            key={item[itemKey]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(index);
            }}
            style={{
              display:
                !(visibleKey in item) || item[visibleKey] ? 'block' : 'none',
            }}
          >
            {renderItem?.(item) || (
              <span css={styles.label}>{item[labelKey]}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DropDownList;
