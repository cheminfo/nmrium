import lodash from 'lodash';
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { useAlert } from 'react-alert';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { SET_PREFERENCES } from '../../reducer/types/Types';
import GroupByInfoKey from '../../utility/GroupByInfoKey';

import ColumnFormatField from './ColumnFormatField';
import { integralDefaultValues } from './defaultValues';

const styles = {
  container: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    height: '100%',
    flex: 1,
  },
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
  showAbsolute: true,
  absoluteFormat: '0.00',
  showNB: true,
  NBFormat: '0.00',
};

const IntegralsPreferences = forwardRef((props, ref) => {
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
    const integralsPreferences = lodash.get(preferences, 'panels.integrals');
    if (integralsPreferences) {
      setSetting(integralsPreferences);
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
        data: { type: 'integrals', values },
      });
      if (showMessage) {
        alert.success('Integrals preferences saved successfully');
      }
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
      label: 'Absolute :',
      checkController: 'showAbsolute',
      formatController: 'absoluteFormat',
      defaultFormat: '0.00',
    },
    {
      id: 2,
      label: 'nb :',
      checkController: 'showNB',
      formatController: 'NBFormat',
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
                  defaultData={integralDefaultValues}
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

export default IntegralsPreferences;
