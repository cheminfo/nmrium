import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { useAlert } from 'react-alert';
import lodash from 'lodash';

import GroupByInfoKey from '../../utility/GroupByInfoKey';
import { useDispatch } from '../../context/DispatchContext';
import { useChartData } from '../../context/ChartContext';
import { SET_PREFERENCES } from '../../reducer/Actions';

import ColumnFormatField from './ColumnFormatField';

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
  const formRef = useRef();

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

  const inputChangeHandler = useCallback((event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    const keys = target.name.split('-');

    setSetting((prevState) => {
      const preGroupValues =
        prevState && Object.prototype.hasOwnProperty.call(prevState, keys[0])
          ? prevState[keys[0]]
          : {};
      return {
        ...prevState,
        [keys[0]]: {
          ...preGroupValues,
          [keys[1]]: value,
        },
      };
    });
  }, []);

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      dispatch({
        type: SET_PREFERENCES,
        data: { type: 'peaks', values },
      });
      if (showMessage) alert.success('Peaks preferences saved successfully');
    },
    [alert, dispatch],
  );

  useImperativeHandle(ref, () => ({
    saveSetting() {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
    },
  }));

  const formatFields = [
    {
      id: 1,
      label: 'Peak Number :',
      checkController: 'showPeakNumber',
      formatController: 'peakNumberFormat',
      defaultFormat: '',
    },
    {
      id: 2,
      label: 'Peak Index : ',
      checkController: 'showPeakIndex',
      formatController: 'peakIndexFormat',
      defaultFormat: '',
    },
    {
      id: 3,
      label: 'δ (ppm) :',
      checkController: 'showDeltaPPM',
      formatController: 'deltaPPMFormat',
      defaultFormat: '00.00',
    },
    {
      id: 4,
      label: 'δ (Hz) :',
      checkController: 'showDeltaHz',
      formatController: 'deltaHzFormat',
      defaultFormat: '00.00',
    },
    {
      id: 5,
      label: 'Peak Width',
      checkController: 'showPeakWidth',
      formatController: 'peakWidthFormat',
      defaultFormat: '00.0000',
    },
    {
      id: 6,
      label: 'Intensity :',
      checkController: 'showIntensity',
      formatController: 'intensityFormat',
      defaultFormat: '00.00',
    },
  ];

  const handleSubmit = async (event) => {
    const form = event.target;
    const formData = new FormData(form);
    let values = {};
    for (let field of formData.entries()) {
      const keys = field[0].split('-');
      const val = form.elements[field[0]].checked ? !!field[1] : field[1];
      values = {
        ...values,
        [keys[0]]: { ...values[keys[0]], [keys[1]]: val },
      };
    }
    saveHandler(values, true);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} ref={formRef}>
        {nucleus &&
          nucleus.map((nucleusLabel) => (
            <div key={nucleusLabel} style={styles.groupContainer}>
              <p style={styles.header}>{nucleusLabel}</p>
              {formatFields.map((field) => (
                <ColumnFormatField
                  key={field.id}
                  label={field.label}
                  data={settings}
                  checkControllerName={field.checkController}
                  formatControllerName={field.formatController}
                  groupID={nucleusLabel}
                  defaultFormat={field.defaultFormat}
                  inputChangeHandler={(e, controllerName) =>
                    inputChangeHandler(e, controllerName)
                  }
                />
              ))}
            </div>
          ))}
      </form>
    </div>
  );
});

export default PeaksPreferences;
