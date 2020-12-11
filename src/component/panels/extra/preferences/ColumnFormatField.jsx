import { memo, useState } from 'react';

const styles = {
  row: {
    display: 'flex',
    margin: '5px 0px',
  },
  inputLabel: {
    flex: 2,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  input: {
    width: '60%',
    textAlign: 'center',
  },
};

const ColumnFormatField = memo(
  ({
    label,
    checkControllerName,
    checked,
    format,
    formatControllerName,
    inputChangeHandler,
    groupID,
  }) => {
    const [_checked, setChecked] = useState(Boolean(checked));

    return (
      <div style={styles.row}>
        <span style={styles.inputLabel}>{label}</span>
        <div style={{ flex: 4 }}>
          <input
            type="checkbox"
            onChange={(e) => setChecked(e.target.checked)}
            style={{ margin: '0px 5px' }}
            defaultChecked={_checked}
          />
          <input
            name={`${groupID}-${checkControllerName}`}
            type="hidden"
            value={_checked}
          />
          <input
            style={styles.input}
            name={`${groupID}-${formatControllerName}`}
            type="text"
            onChange={inputChangeHandler}
            defaultValue={format}
          />
        </div>
      </div>
    );
  },
);

export default ColumnFormatField;
