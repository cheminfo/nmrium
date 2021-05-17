import { useCallback, useRef, useState, Fragment } from 'react';

import { baselineAlgorithms } from '../../data/data1d/filter1d/baselineCorrection';
import { useDispatch } from '../context/DispatchContext';
import NumberInput from '../elements/NumberInput';
import Select from '../elements/Select';
import {
  RESET_SELECTED_TOOL,
  APPLY_BASE_LINE_CORRECTION_FILTER,
} from '../reducer/types/Types';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
  actionButton: {
    height: '100%',
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
};

function BaseLineCorrectionPanel() {
  const dispatch = useDispatch();
  const algorithmRef = useRef();
  const maxIterationsRef = useRef();
  const toleranceRef = useRef();
  const degreeRef = useRef();
  const [algorithm, setAlgorithm] = useState('polynomial');

  const handleApplyFilter = useCallback(() => {
    let options = {};
    switch (algorithm) {
      case 'airpls':
        options = {
          algorithm: algorithmRef.current.value,
          maxIterations: maxIterationsRef.current.value,
          tolerance: toleranceRef.current.value,
        };
        break;
      case 'polynomial':
        options = {
          algorithm: algorithmRef.current.value,
          degree: degreeRef.current.value,
        };
        break;
      default:
        break;
    }
    dispatch({
      type: APPLY_BASE_LINE_CORRECTION_FILTER,
      options,
    });
  }, [algorithm, dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  const getAlgorithmsList = useCallback(() => {
    return Object.keys(baselineAlgorithms).map((val) => {
      return { key: val, label: baselineAlgorithms[val], value: val };
    });
  }, []);

  const changeAlgorithmHandler = useCallback((val) => {
    setAlgorithm(val);
  }, []);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Algorithm: </span>
      <Select
        ref={algorithmRef}
        data={getAlgorithmsList()}
        style={{ marginLeft: 10, marginRight: 10 }}
        onChange={changeAlgorithmHandler}
        defaultValue="polynomial"
      />
      {algorithm && algorithm === 'airpls' && (
        <Fragment>
          <NumberInput
            label="maxIterations:"
            ref={maxIterationsRef}
            name="maxIterations"
            defaultValue={100}
          />
          <NumberInput
            label="tolerance:"
            ref={toleranceRef}
            name="tolerance"
            defaultValue={0.001}
          />
        </Fragment>
      )}

      {algorithm && ['autoPolynomial', 'polynomial'].includes(algorithm) && (
        <NumberInput
          label="degree:"
          ref={degreeRef}
          name="degree"
          defaultValue={3}
          min={1}
          max={6}
          pattern="[1-6]+"
        />
      )}

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

export default BaseLineCorrectionPanel;
