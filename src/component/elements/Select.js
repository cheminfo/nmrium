import React, { useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const Select = React.forwardRef(
  ({ data, style, onChange, defaultValue }, ref) => {
    const handleOnChanged = useCallback(
      (e) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    const styles = css`
      position: relative;
      padding: 5px;
      border: 0.55px solid #cacaca;
      font-size: 14px;
      width: ${style.width ? style.width - 5 : 115}px;
      margin: 0;
      height: 100%;
      background: url(../img/br_down.png) no-repeat right white;
      -webkit-appearance: none;
      background-position-x: ${style.width ? style.width - 18 : 115 - 18}px;
      background-size: 10px 10px;
      border-radius: 5px;
      margin: 0px 5px;
      :focus,
      input:focus {
        outline: none;
      }
    `;

    return (
      <select
        css={styles}
        ref={ref}
        onChange={handleOnChanged}
        defaultValue={defaultValue}
      >
        {data.map((d) => (
          <option
            key={`${d.key}`}
            value={d.value}
            // selected={d.value === defaultValue ? 'selected' : ''}
          >
            {d.label}
          </option>
        ))}
      </select>
    );
  },
);

Select.defaultProps = {
  onChange: function() {
    return null;
  },
  ref: null,
};

export default Select;
