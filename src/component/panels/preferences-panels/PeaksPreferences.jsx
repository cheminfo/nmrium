import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useAlert } from 'react-alert';
import lodash from 'lodash';

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
  PPMShow: true,
  PPMFormat: '0.00',
  HZShow: true,
  HZFormat: '0.00',
  peakWidthShow: true,
  peakFormat: '0.00',
};

const PeaksPreferences = forwardRef((props, ref) => {
  const { data, preferences } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();

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
    }
  }, [data, getDefaultValues, settings]);

  useEffect(() => {
    const peaksPreferences = lodash.get(preferences, 'panels.peaks');
    if (peaksPreferences) {
      setSetting(peaksPreferences);
    }
  }, [preferences]);

  const inputChangeHandler = useCallback((event, nucleusKey) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

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
    dispatch({
      type: SET_PREFERENCES,
      data: { type: 'peaks', values: settings },
    });
    alert.success('Peaks preferences saved successfully');
  }, [alert, dispatch, settings]);

  const getValue = useCallback(
    (nucleusLabel, key) => {
      const value = lodash.get(settings, `${nucleusLabel}.${key}`);
      return value ? value : null;
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
                  defaultChecked={true}
                />
              </div>
            </div>
            <div style={styles.row}>
              <span style={styles.inputLabel}>δ (ppm) : </span>
              <div style={{ flex: 4 }}>
                <input
                  name="PPMShow"
                  type="checkbox"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  style={{ margin: '0px 5px' }}
                  checked={getValue(nucleusLabel, 'PPMShow')}
                />
                <input
                  style={styles.input}
                  name="PPMFormat"
                  type="text"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  value={getValue(nucleusLabel, 'ppmFormat')}
                />
              </div>
            </div>
            <div style={styles.row}>
              <span style={styles.inputLabel}>𝜈 (Hz): </span>
              <div style={{ flex: 4 }}>
                <input
                  name="HZShow"
                  type="checkbox"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  style={{ margin: '0px 5px' }}
                  checked={getValue(nucleusLabel, 'HZShow')}
                />
                <input
                  style={styles.input}
                  name="HZFormat"
                  type="text"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  value={getValue(nucleusLabel, 'HZFormat')}
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
                  name="peakWidthFormat"
                  type="text"
                  onChange={(e) => inputChangeHandler(e, nucleusLabel)}
                  value={getValue(nucleusLabel, 'peakWidthFormat')}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
});

export default PeaksPreferences;
