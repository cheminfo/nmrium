import React, { useState, useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = css`
  position: relative;
  background-color: white;
  border: solid grey 1px;
  width: 120px;
  height: 100%;
  border-radius: 5px;
  select {
    position: absolute;
    top: 0px;
    left: 2px;
    font-size: 14px;
    border: none;
    width: 115px;
    margin: 0;
  }
  input {
    position: absolute;
    top: 0px;
    left: 2px;
    width: 98px;
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

const Select = React.forwardRef(({ data, style }, ref) => {
  const [value, setValue] = useState();
  const handleOnChanged = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return (
    <div css={styles} style={style}>
      <select onChange={handleOnChanged}>
        {/* <option value="" /> */}
        {data.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
      <input key="input" ref={ref} type="text" value={value} />
    </div>
  );
});

Select.defaultProps = {
  onChange: function() {
    return null;
  },
};

export default Select;
