/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

const SelectUncontrolled = ({ data, style, onChange, value }) => {
  const handleOnChanged = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const styles = css`
    position: relative;
    padding: 0px 5px;
    border: 0.55px solid #cacaca;
    font-size: 14px;
    width: ${style.width ? style.width - 5 : 95}px;
    margin: 0;
    height: 100%;
    background: url(../img/br_down.png) no-repeat right white;
    -webkit-appearance: none;
    background-position-x: ${style.width ? style.width - 18 : 95 - 18}px;
    background-size: 10px 10px;
    border-radius: 5px;
    margin: 0px 5px;
    :focus,
    input:focus {
      outline: none;
    }
  `;

  return (
    <select css={[styles, style]} onChange={handleOnChanged} value={value}>
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
};

SelectUncontrolled.propTypes = {
  onChange: PropTypes.func,
  data: PropTypes.array.isRequired,
  style: PropTypes.any,
  value: PropTypes.any,
};

SelectUncontrolled.defaultProps = {
  onChange: function () {
    return null;
  },
};

export default SelectUncontrolled;
