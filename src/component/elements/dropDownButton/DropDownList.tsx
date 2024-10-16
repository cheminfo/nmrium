/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import type {
  DropDownListItem,
  DropDownListProps,
  ItemProps,
} from './DropDownButton.js';

const styles = {
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
      background-color: #f6f6f6;
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
  return (
    <div>
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
              cursor: 'pointer',
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
