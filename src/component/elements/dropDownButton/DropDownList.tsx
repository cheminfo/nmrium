/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

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
    color: black;
    border-bottom: 0.55px solid #f9f9f9;
    min-width: 150px;

    &:last-of-type {
      border-bottom: none;
    }

    &:hover {
      background-color: gray;
      color: white;
    }
  `,
  label: css`
    padding: 10px 30px;
    display: block;
  `,
};

function DropDownList({
  data = [],
  onSelect,
  renderItem = null,
}: DropDownListProps) {
  return (
    <div css={styles.container}>
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
