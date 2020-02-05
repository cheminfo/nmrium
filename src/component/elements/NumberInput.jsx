import React, { Fragment, forwardRef } from 'react';
import PropTypes from 'prop-types';

const styles = {
  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
  input: {
    height: '100%',
    width: '100px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
};

const NumberInput = forwardRef(
  (
    { label, name, defaultValue, style, onChange, onInput, pattern, step },
    ref,
  ) => {
    return (
      <Fragment>
        <span style={{ ...styles.label, ...style.label }}>{label}</span>
        <input
          ref={ref}
          name={name}
          style={{ ...styles.input, ...style.input }}
          type="number"
          pattern={pattern}
          step={step}
          defaultValue={defaultValue}
          onChange={onChange}
          onInput={onInput}
        />
      </Fragment>
    );
  },
);

NumberInput.propTypes = {
  pattern: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  step: PropTypes.any,
  defaultValue: PropTypes.number,
  style: PropTypes.shape({
    label: PropTypes.object,
    input: PropTypes.object,
  }),
  onChange: PropTypes.func,
  onInput: PropTypes.func,
};

NumberInput.defaultProps = {
  pattern: '^d*(.d{0,2})?$',
  step: 'any',
  style: {
    label: {},
    input: {},
  },
  defaultValue: 0,
  onChange: () => {
    return null;
  },
  onInput: () => {
    return null;
  },
};

export default NumberInput;
