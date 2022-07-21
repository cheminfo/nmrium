import { CSSProperties, useCallback, useRef, useState } from 'react';

import { Data1D } from '../../data/types/data1d';
import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Select from '../elements/Select';
import {
  APPLY_ZERO_FILLING_FILTER,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';

const styles: Record<'container' | 'input' | 'label', CSSProperties> = {
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

  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
};

const Sizes = generateNumbersPowerOfX(8, 21);

function ZeroFillingOptionsPanel() {
  const dispatch = useDispatch();
  const { data, activeSpectrum } = useChartData();
  const sizeTextInputRef = useRef<any>();
  const [lineBroadeningValue, setLineBroadeningValue] = useState(1);
  const [gaussBroadeningValue, setGaussBroadeningValue] = useState(0);
  const [centerValue, setCenterValue] = useState(0);
  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      value: {
        zeroFilling: {
          size: Number(sizeTextInputRef.current.value),
        },
        apodization: {
          lineBroadeningValue,
          gaussBroadeningValue,
          centerValue,
        },
      },
    });
  }, [dispatch, lineBroadeningValue, gaussBroadeningValue, centerValue]);

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
        const inputLabel = e.target.name;
        const [currentValue, setter] =
          inputLabel === 'exponentialHz'
            ? [lineBroadeningValue, setLineBroadeningValue]
            : inputLabel === 'gaussianHz'
            ? [gaussBroadeningValue, setGaussBroadeningValue]
            : [centerValue, setCenterValue];
        const _value = e.target.validity.valid
          ? Number(e.target.value)
          : currentValue;
        setter(_value);
      }
    },
    [lineBroadeningValue, centerValue, gaussBroadeningValue],
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
      <span style={styles.label}>LB: </span>
      <input
        name="exponentialHz"
        style={styles.input}
        type="number"
        defaultValue={lineBroadeningValue}
        onInput={handleInput}
        pattern="^\d*(\.\d{0,2})?$"
        step="any"
      />
      <span style={styles.label}>GB: </span>
      <input
        name="gaussianHz"
        style={styles.input}
        type="number"
        defaultValue={gaussBroadeningValue}
        onInput={handleInput}
        pattern="^\d*(\.\d{0,2})?$"
        step="any"
      />
      <span style={styles.label}>GF: </span>
      <input
        name="line-broadening-center"
        style={styles.input}
        type="number"
        defaultValue={centerValue}
        onInput={handleInput}
        pattern="^\d*(\.\d{0,2})?$"
        step="any"
      />
      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </div>
  );
}

export default ZeroFillingOptionsPanel;
