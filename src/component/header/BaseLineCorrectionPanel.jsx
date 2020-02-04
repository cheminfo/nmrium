import React, { useCallback, useRef } from 'react';

import {
  RESET_SELECTED_TOOL,
  APPLY_BASE_LINE_CORRECTION_FILTER,
} from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import { baselineAlgorithms } from '../../data/data1d/filter1d/baselineCorrection';
import Select from '../elements/Select';

const styles = {
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

const BaseLineCorrectionPanel = () => {
  const dispatch = useDispatch();
  const algorithmRef = useRef();
  const functionRef = useRef();
  const maxIterationsRef = useRef();
  const toleranceRef = useRef();

  // const [algorithm, setSelectedAlgorithm] = useState();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_BASE_LINE_CORRECTION_FILTER,
      options: {
        algorithm: algorithmRef.current.value,
        functionName: functionRef.current.value,
        maxIterations: maxIterationsRef.current.value,
        tolerance: toleranceRef.current.value,
      },
    });
  }, [dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  const getAlgorithmsList = useCallback(() => {
    return Object.keys(baselineAlgorithms).map((val) => {
      return { key: val, label: val, value: val };
    });
  }, []);
  const getBaseCorrectionFunctionsList = useCallback(() => {
    return Object.keys(baselineAlgorithms.regression).map((val) => {
      return { key: val, label: val, value: val };
    });
  }, []);

  // const algorithmChangeHandler = useCallback((val) => {
  //   setSelectedAlgorithm(val);
  // }, []);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Algorithm: </span>
      <Select
        ref={algorithmRef}
        data={getAlgorithmsList()}
        style={{ marginLeft: 10, marginRight: 10 }}
        // onChange={algorithmChangeHandler}
        // defaultValue={getDefaultValue()}
      />

      <span style={styles.label}>Function: </span>
      <Select
        ref={functionRef}
        data={getBaseCorrectionFunctionsList()}
        style={{ marginLeft: 10, marginRight: 10 }}
        // onChange={(d) => console.log(d)}
        // defaultValue={getDefaultValue()}
      />

      <span style={styles.label}>maxIterations: </span>
      <input
        ref={maxIterationsRef}
        name="maxIterations"
        style={styles.input}
        type="number"
        pattern="^\d*(\.\d{0,2})?$"
        step="any"
        defaultValue={100}
      />
      <span style={styles.label}>tolerance: </span>
      <input
        ref={toleranceRef}
        name="tolerance"
        style={styles.input}
        type="number"
        pattern="^\d*(\.\d{0,2})?$"
        step="any"
        defaultValue={0.001}
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
};

export default BaseLineCorrectionPanel;
