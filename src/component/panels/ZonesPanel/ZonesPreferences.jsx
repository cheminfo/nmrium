import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  memo,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import { useAlert } from '../../elements/popup/Alert';
import ZonesWrapper from '../../hoc/ZonesWrapper';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import {
  useStateWithLocalStorage,
  getValue as getValueByKeyPath,
} from '../../utility/LocalStorage';
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

function ZonesPreferences({ nucleus }, ref) {
  const alert = useAlert();
  const [, setSettingsData] = useStateWithLocalStorage('nmr-general-settings');
  const preferences = usePreferences();

  const [settings, setSetting] = useState(null);
  const formRef = useRef();
  useEffect(() => {
    const zonesPreferences = getValueByKeyPath(
      preferences,
      'formatting.panels.zones',
    );
    if (zonesPreferences) {
      setSetting(zonesPreferences);
    }
  }, [preferences]);

  const saveToLocalStorgate = (values) => {
    setSettingsData(values, 'formatting.panels.ranges');
  };

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      preferences.dispatch({
        type: SET_PANELS_PREFERENCES,
        payload: { key: 'zones', value: values },
      });
      if (showMessage) {
        alert.success('zones preferences saved successfully');
      }
    },
    [alert, preferences],
  );

  useImperativeHandle(ref, () => ({
    saveSetting() {
      if (typeof formRef.current.requestSubmit === 'function') {
        formRef.current.requestSubmit();
      } else {
        formRef.current.dispatchEvent(
          new Event('submit', { cancelable: true }),
        );
      }
    },
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    let values = {};
    for (const field of formData.entries()) {
      const keys = field[0].split('-').join('.');
      const val = ['true', 'false'].includes(field[1])
        ? field[1] === 'true'
        : field[1];
      values = lodashSet(values, keys, val);
    }

    saveHandler(values, true);
    saveToLocalStorgate(values);
  };

  const getValue = useCallback(
    (...params) => {
      const keys = params.join('.');
      if (settings) {
        const value = lodashGet(settings, keys);
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
}

export default ZonesWrapper(memo(forwardRef(ZonesPreferences)));
