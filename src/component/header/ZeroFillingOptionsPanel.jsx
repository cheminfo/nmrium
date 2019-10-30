import React, { useCallback, useRef } from 'react';

import { APPLY_ZERO_FILLING_FILTER } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import Select from '../elements/Select';
import { useChartData } from '../context/ChartContext';

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
    values.push({
      key: result,
      label: formatNumber(result),
      value: result,
    });
  }
  return values;
}
function formatNumber(number) {
  if (number >= 1024 * 1024) {
    return `${number / (1024 * 1024)}M`;
  } else if (number >= 1024) {
    return `${number / 1024}K`;
  } else {
    return number;
  }
}

const Sizes = generateSizes();

const ZeroFillingOptionsPanel = () => {
  const dispatch = useDispatch();
  const { data, activeSpectrum } = useChartData();
  const sizeTextInputRef = useRef();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      value: Number(sizeTextInputRef.current.value),
    });
  }, [dispatch]);

  const getDefaultValue = useCallback(() => {
    if (data && activeSpectrum) {
      const spectrum = data.find((d) => d.id === activeSpectrum.id);
      return 2 ** Math.round(Math.log2(spectrum.x.length)) + 1;
    }
    return '';
  }, [activeSpectrum, data]);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Size: </span>
      <Select
        ref={sizeTextInputRef}
        data={Sizes}
        style={{ marginLeft: 10, marginRight: 10 }}
        defaultValue={getDefaultValue()}
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
