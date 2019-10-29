import React, { useCallback, useRef } from 'react';

import { APPLY_ZERO_FILLING_FILTER } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import Select from '../elements/Select';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  input: {
    height: '100%',
  },
  applyButton: {
    height: '100%',
    width: '50px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
  },
  label: {
    lineHeight: 2,
  },
};

function generateSizes(start = 8, end = 21) {
  let values = [];
  for (let i = start; i <= end; i++) {
    const result = 2 ** i;
    const formatedResult = formatNumber(result);
    values.push({
      key: result,
      label: formatedResult,
      value: result,
    });
  }
  return values;
}
function formatNumber(number) {
  const val = String(number);
  if (val.length > 6) {
    return `${val.substr(0, val.length - 6)}M`;
  } else if (val.length > 3) {
    return `${val.substr(0, val.length - 3)}K`;
  } else {
    return val;
  }
}

// function getRealValue(val = '') {
//   const map = {
//     m: '000000',
//     k: '000',
//   };
//   return val.toLowerCase().replace(/k|m/g, (matched) => {
//     return map[matched];
//   });
// }

const Sizes = generateSizes();
const ZeroFillingOptionsPanel = () => {
  const dispatch = useDispatch();
  const sizeTextInputRef = useRef();

  const handleApplyFilter = useCallback(() => {
    if (sizeTextInputRef.current.value.trim() !== '') {
      console.log(sizeTextInputRef.current.value)
      dispatch({
        type: APPLY_ZERO_FILLING_FILTER,
        value: sizeTextInputRef.current.value,
      });
    }
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Size: </span>
      <Select
        ref={sizeTextInputRef}
        data={Sizes}
        style={{ marginLeft: 10, marginRight: 10 }}
      />
      <button
        type="button"
        style={styles.applyButton}
        onClick={handleApplyFilter}
      >
        Apply
      </button>
    </div>
  );
};

export default ZeroFillingOptionsPanel;
