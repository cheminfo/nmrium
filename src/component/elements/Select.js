import React, { useState, useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const Select = React.forwardRef(({ data, style, filter, onChange }, ref) => {
  const [value, setValue] = useState('');
  const handleOnChanged = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  const handleInputChanged = useCallback(
    (e) => {
      if (filter) {
        setValue(filter(e.target.value));
      } else {
        setValue(e.target.value);
      }
      onChange(e.target.value);
    },
    [filter, onChange],
  );

  const styles = css`
    position: relative;
    background-color: white;
    border: solid grey 1px;
    width: ${style.width ? style.width : '120'}px;
    height: ${style.height ? style.height : '25'}px;
    border-radius: 5px;
    select {
      position: absolute;
      top: 0px;
      left: 2px;
      font-size: 14px;
      border: none;
      width: ${style.width ? style.width - 5 : 115}px;
      margin: 0;
      height: 100%;
      background: url(../img/br_down.png) no-repeat right white;
      -webkit-appearance: none;
      background-position-x: ${style.width ? style.width - 14 : 115 - 14}px;
      background-size: 10px 10px;
      border-radius: 5px;
    }
    input {
      position: absolute;
      top: 0px;
      left: 2px;
      width: ${style.width ? style.width - 22 : 98}px;
      padding: 1px;
      font-size: 12px;
      height: 100%;
      border: none;
    }
    select:focus,
    input:focus {
      outline: none;
    }
  `;

  return (
    <div key="input" css={styles} style={style}>
      <select onChange={handleOnChanged}>
        {data.map((d) => (
          <option key={`${d.key}`} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleInputChanged}
      />
    </div>
  );
});

Select.defaultProps = {
  onChange: function() {
    return null;
  },
  ref: null,
};

export default Select;
