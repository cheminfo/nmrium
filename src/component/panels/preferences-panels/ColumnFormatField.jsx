import React, { useCallback, memo } from 'react';
import lodash from 'lodash';

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
    formatControllerName,
    defaultFormat,
    inputChangeHandler,
    groupID,
    data,
  }) => {
    // const {
    //   label,
    //   checkControllerName,
    //   formatControllerName,
    //   defaultFormat,
    //   inputChangeHandler,
    //   groupID,
    //   data,
    // } = props;

    const getValue = useCallback(
      (nucleusLabel, key) => {
        const value = lodash.get(data, `${nucleusLabel}.${key}`);
        return value ? value : null;
      },
      [data],
    );

    return (
      <div style={styles.row}>
        <span style={styles.inputLabel}>{label}</span>
        <div style={{ flex: 4 }}>
          <input
            name={`${groupID}-${checkControllerName}`}
            type="checkbox"
            onChange={(e) =>
              inputChangeHandler(e, groupID - checkControllerName)
            }
            style={{ margin: '0px 5px' }}
            checked={getValue(groupID, checkControllerName)}
            defaultChecked={true}
          />
          <input
            style={styles.input}
            name={`${groupID}-${formatControllerName}`}
            type="text"
            onChange={(e) =>
              inputChangeHandler(e, groupID - formatControllerName)
            }
            value={getValue(groupID, formatControllerName)}
            defaultValue={defaultFormat}
          />
        </div>
      </div>
    );
  },
);

export default ColumnFormatField;
