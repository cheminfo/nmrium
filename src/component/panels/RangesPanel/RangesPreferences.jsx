import lodash from 'lodash';
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  memo,
} from 'react';
import { useAlert } from 'react-alert';

import { useDispatch } from '../../context/DispatchContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import { SET_PREFERENCES } from '../../reducer/types/Types';
import { useStateWithLocalStorage } from '../../utility/LocalStorage';
import { GetPreference } from '../../utility/PreferencesHelper';
import ColumnFormatField from '../extra/preferences/ColumnFormatField';
import { rangeDefaultValues } from '../extra/preferences/defaultValues';

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

const RangesPreferences = forwardRef(({ nucleus, preferences }, ref) => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const [settingData, setSettingsData] = useStateWithLocalStorage('settings');

  const [settings, setSetting] = useState(null);
  const formRef = useRef();

  useEffect(() => {
    const integralsPreferences = GetPreference(preferences, 'ranges');
    if (integralsPreferences) {
      setSetting(integralsPreferences);
    }
  }, [preferences]);

  const saveToLocalStorgate = (values) => {
    let globalSettings = { ...settingData };
    globalSettings = lodash.set(globalSettings, 'panels.ranges', values);
    setSettingsData(JSON.stringify(globalSettings));
  };

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      dispatch({
        type: SET_PREFERENCES,
        data: { type: 'ranges', values },
      });
      if (showMessage) {
        alert.success('ranges preferences saved successfully');
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
      label: 'From :',
      checkController: 'showFrom',
      formatController: 'fromFormat',
      defaultFormat: '0.00',
    },
    {
      id: 2,
      label: 'To :',
      checkController: 'showTo',
      formatController: 'toFormat',
      defaultFormat: '0.00',
    },
    {
      id: 3,
      label: 'Absolute :',
      checkController: 'showAbsolute',
      formatController: 'absoluteFormat',
      defaultFormat: '0.00',
    },
    {
      id: 4,
      label: 'Relative :',
      checkController: 'showRelative',
      formatController: 'relativeFormat',
      defaultFormat: '00.00',
    },
  ];

  const handleSubmit = async (event) => {
    const form = event.target;
    const formData = new FormData(form);
    let values = {};
    for (const field of formData.entries()) {
      const keys = field[0].split('-').join('.');
      const val = ['true', 'false'].includes(field[1])
        ? field[1] === 'true'
        : field[1];
      values = lodash.set(values, keys, val);
    }

    saveHandler(values, true);
    saveToLocalStorgate(values);
  };

  const getValue = useCallback(
    (...params) => {
      const keys = params.join('.');
      if (settings) {
        const value = lodash.get(settings, keys);
        return value ? value : null;
      } else {
        const keyIndex = params.length - 1;
        return rangeDefaultValues[params[keyIndex]];
      }
    },
    [settings],
  );

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} ref={formRef}>
        {nucleus &&
          nucleus.map((nucleusLabel) => (
            <div key={nucleusLabel} style={styles.groupContainer}>
              <IsotopesViewer style={styles.header} value={nucleusLabel} />
              {formatFields.map((field) => (
                <ColumnFormatField
                  key={field.id}
                  label={field.label}
                  checked={getValue(nucleusLabel, field.checkController)}
                  format={getValue(nucleusLabel, field.formatController)}
                  checkControllerName={field.checkController}
                  formatControllerName={field.formatController}
                  groupID={nucleusLabel}
                />
              ))}
            </div>
          ))}
      </form>
    </div>
  );
});

export default memo(RangesPreferences);
