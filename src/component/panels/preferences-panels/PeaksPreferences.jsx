import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { useDispatch } from '../../context/DispatchContext';
import { useChartData } from '../../context/ChartContext';
import { SET_PREFERENCES } from '../../reducer/Actions';

const styles = {
  container: { padding: 10, backgroundColor: '#f1f1f1', height: '100%' },
  groupContainer: {
    padding: '5px',
    borderRadius: '5px',
    margin: '10px 0px',
    backgroundColor: 'white',
  },
  row: {
    display: 'flex',
    margin: '5px 0px',
  },
  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
  inputLabel: {
    flex: 2,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  input: {
    width: '30%',
    textAlign: 'center',
  },
};

const defaultValues = {
  showPanel: true,
  ppmShow: true,
  ppmDecimalsNumber: 2,
  HzShow: true,
  HzDecimalsNumber: 2,
  peakWidthShow: true,
  peakDecimalsNumber: 2,
};

const PeaksPreferences = forwardRef((props, ref) => {
  const { data, preferences } = useChartData();
  const dispatch = useDispatch();

  const [nucleus, setNucleus] = useState([]);
  const [settings, setSetting] = useState(null);

  const getDefaultValues = useCallback((nucleusList) => {
    const _values = nucleusList.reduce((accumulator, key) => {
      accumulator = { ...accumulator, [key]: defaultValues };
      return accumulator;
    }, {});
    return _values;
  }, []);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const groupByNucleus = GroupByInfoKey('nucleus');
      const nucleusList = Object.keys(groupByNucleus(data));
      setNucleus(nucleusList);
      //   if (!settings && Array.isArray(nucleusList) && nucleusList.length > 0) {
      //     setSetting(getDefaultValues(nucleusList));
      //   }
    }
  }, [data, getDefaultValues, settings]);

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(preferences, 'peaks')) {
      setSetting(preferences.peaks);
    }
  }, [preferences]);

  const inputChangeHandler = useCallback((event, nucleusKey) => {
    const target = event.target;
    const value =
      target.type === 'checkbox'
        ? target.checked
        : Number.isNaN(target.value)
        ? target.value
        : Number(target.value);
    const name = target.name;

    setSetting((prevState) => {
      const preGroupValues =
        prevState && Object.prototype.hasOwnProperty.call(prevState, nucleusKey)
          ? prevState[nucleusKey]
          : {};
      return {
        ...prevState,
        [nucleusKey]: {
          ...preGroupValues,
          [name]: value,
        },
      };
    });
  }, []);

  const saveHandler = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log(settings);
    dispatch({
      type: SET_PREFERENCES,
      data: { type: 'peaks', values: settings },
    });
  }, [dispatch, settings]);

  const getValue = useCallback(
    (nucleusLabel, key) => {
      const value =
        settings &&
        Object.prototype.hasOwnProperty.call(settings, nucleusLabel) &&
        Object.prototype.hasOwnProperty.call(settings[nucleusLabel], key)
          ? settings[nucleusLabel][key]
          : null;
      return value;
    },
    [settings],
  );

  useImperativeHandle(ref, () => ({
    saveSetting() {
      saveHandler();
    },
  }));

  return (
    <div style={styles.container}>
      {nucleus &&
        nucleus.map((nucleusLabel) => (
          <div key={nucleusLabel} style={styles.groupContainer}>
            <p style={styles.header}>{nucleusLabel}</p>
            <div style={styles.row}>
              <span style={styles.inputLabel}>Show: </span>
              <div style={{ flex: 4 }}>
                <input
                  name="showPanel"
                  type="checkbox"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  checked={
                    getValue(nucleusLabel, 'showPanel')
                      ? getValue(nucleusLabel, 'showPanel')
                      : false
                  }
                />
              </div>
            </div>
            <div style={styles.row}>
              <span style={styles.inputLabel}>δ (ppm) : </span>
              <div style={{ flex: 4 }}>
                <input
                  name="ppmShow"
                  type="checkbox"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  style={{ margin: '0px 5px' }}
                  checked={getValue(nucleusLabel, 'ppmShow')}
                />
                <input
                  style={styles.input}
                  name="ppmDecimalsNumber"
                  type="number"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  value={getValue(nucleusLabel, 'ppmDecimalsNumber')}
                />
              </div>
            </div>
            <div style={styles.row}>
              <span style={styles.inputLabel}>𝜈 (Hz): </span>
              <div style={{ flex: 4 }}>
                <input
                  name="HzShow"
                  type="checkbox"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  style={{ margin: '0px 5px' }}
                  checked={getValue(nucleusLabel, 'HzShow')}
                />
                <input
                  style={styles.input}
                  name="HzDecimalsNumber"
                  type="number"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  value={getValue(nucleusLabel, 'HzDecimalsNumber')}
                />
              </div>
            </div>
            <div style={styles.row}>
              <span style={styles.inputLabel}>peak width: </span>
              <div style={{ flex: 4 }}>
                <input
                  name="peakWidthShow"
                  type="checkbox"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  style={{ margin: '0px 5px' }}
                  checked={getValue(nucleusLabel, 'peakWidthShow')}
                />
                <input
                  style={styles.input}
                  name="peakWidthDecimalsNumber"
                  type="number"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  value={getValue(nucleusLabel, 'peakWidthDecimalsNumber')}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
});

export default PeaksPreferences;
