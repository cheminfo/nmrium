import PropTypes from 'prop-types';
import { forwardRef, useCallback, useRef } from 'react';

const styles = {
  container: {
    display: 'flex',
  },
  label: {
    lineHeight: 2,
    userSelect: 'none',
    flex: '2',
  },
  inputContainer: {
    flex: '4',
    display: 'flex',
    justifyContent: 'flex-start',
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

const NumberInput = forwardRef(function NumberInput(
  { label, name, defaultValue, style, onChange, onInput, pattern, step, min },
  ref,
) {
  const localRef = useRef();
  const changeHander = useCallback(
    (e) => {
      if (e.target.checkValidity()) {
        if (e.target.value === '') {
          onChange({ ...e, target: { ...e.target, value: defaultValue } });
        } else {
          onChange(e);
        }
      } else {
        const _ref = ref ? ref : localRef;
        _ref.current.value = defaultValue;
      }
    },
    [defaultValue, onChange, ref],
  );
  return (
    <div style={{ ...styles.container, ...style.container }}>
      <span style={{ ...styles.label, ...style.label }}>{label}</span>
      <div style={{ ...styles.inputContainer, ...style.inputContainer }}>
        <input
          ref={ref ? ref : localRef}
          name={name}
          style={{ ...styles.input, ...style.input }}
          type="number"
          pattern={pattern}
          defaultValue={defaultValue}
          step={step}
          onChange={changeHander}
          onInput={onInput}
          min={min}
          key={defaultValue}
        />
      </div>
    </div>
  );
});

NumberInput.propTypes = {
  pattern: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  step: PropTypes.any,
  min: PropTypes.any,
  defaultValue: PropTypes.number,
  style: PropTypes.shape({
    container: PropTypes.object,
    label: PropTypes.object,
    inputContainer: PropTypes.object,
    input: PropTypes.object,
  }),
  onChange: PropTypes.func,
  onInput: PropTypes.func,
};

NumberInput.defaultProps = {
  pattern: '^d*(.d{0,2})?$',
  step: 'any',
  min: 'any',
  style: {
    label: {},
    input: {},
    container: {},
    inputContainer: {},
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
