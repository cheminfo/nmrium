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

const TextInput = forwardRef(
  ({ label, name, defaultValue, style, onChange }, ref) => {
    return (
      <Fragment>
        <span style={{ ...styles.label, ...style.label }}>{label}</span>
        <input
          ref={ref}
          name={name}
          style={{ ...styles.input, ...style.input }}
          type="text"
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </Fragment>
    );
  },
);

TextInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  defaultValue: PropTypes.number,
  style: PropTypes.shape({
    label: PropTypes.object,
    input: PropTypes.object,
  }),
  onChange: PropTypes.func,
};

TextInput.defaultProps = {
  style: {
    label: {},
    input: {},
  },
  defaultValue: 0,
  onChange: () => {
    return null;
  },
};

export default TextInput;
