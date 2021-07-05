import { CSSProperties, useCallback, useRef, useState } from 'react';

import { Data1D } from '../../data/data1d/Spectrum1D';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import Select from '../elements/Select';
import {
  APPLY_ZERO_FILLING_FILTER,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';

const styles: Record<
  'container' | 'input' | 'actionButton' | 'label',
  CSSProperties
> = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },

  input: {
    height: '100%',
    width: '80px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
  actionButton: {
    height: '100%',
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
};

function generateSizes(start = 8, end = 21) {
  let values: Array<{ key: number; label: string | number; value: number }> =
    [];
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

function formatNumber(number: number): string | number {
  if (number >= 1024 * 1024) {
    return `${number / (1024 * 1024)}M`;
  } else if (number >= 1024) {
    return `${number / 1024}K`;
  } else {
    return number;
  }
}

const Sizes = generateSizes();

function ZeroFillingOptionsPanel() {
  const dispatch = useDispatch();
  const { data, activeSpectrum } = useChartData();
  const sizeTextInputRef = useRef<any>();
  const [lineBroadeningValue, setLineBroadeningValue] = useState(1);

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      value: {
        zeroFillingSize: Number(sizeTextInputRef.current.value),
        lineBroadeningValue: lineBroadeningValue,
      },
    });
  }, [dispatch, lineBroadeningValue]);

  const getDefaultValue = useCallback(() => {
    if (data && activeSpectrum?.id) {
      return (
        2 **
        Math.round(
          Math.log2((data[activeSpectrum.index].data as Data1D).x.length),
        )
      );
    }
    return '';
  }, [activeSpectrum, data]);

  const handleInput = useCallback(
    (e) => {
      if (e.target) {
        const _value = e.target.validity.valid
          ? Number(e.target.value)
          : lineBroadeningValue;
        setLineBroadeningValue(_value);
      }
    },
    [lineBroadeningValue],
  );

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Size: </span>
      <Select
        ref={sizeTextInputRef}
        data={Sizes}
        style={{ marginLeft: 10, marginRight: 10 }}
        defaultValue={getDefaultValue()}
      />
      <span style={styles.label}>Line Broadening: </span>
      <input
        name="line-broadening"
        style={styles.input}
        type="number"
        defaultValue={lineBroadeningValue}
        onInput={handleInput}
        pattern="^\d*(\.\d{0,2})?$"
        step="any"
      />

      <button
        type="button"
        style={styles.actionButton}
        onClick={handleApplyFilter}
      >
        Apply
      </button>

      <button
        type="button"
        style={styles.actionButton}
        onClick={handleCancelFilter}
      >
        Cancel
      </button>
    </div>
  );
}

export default ZeroFillingOptionsPanel;
