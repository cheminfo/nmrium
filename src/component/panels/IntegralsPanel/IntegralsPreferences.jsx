import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { MF } from 'react-mf';

import ColorInput from '../../elements/ColorInput';
import NumberInput from '../../elements/NumberInput';
import { useAlert } from '../../elements/popup/Alert';
import IntegralsWrapper from '../../hoc/IntegralsWrapper';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import {
  useStateWithLocalStorage,
  getValue as getValueByKeyPath,
} from '../../utility/LocalStorage';
import ColumnFormatField from '../extra/preferences/ColumnFormatField';
import { integralDefaultValues } from '../extra/preferences/defaultValues';

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
    label: 'Absolute :',
    checkController: 'showAbsolute',
    formatController: 'absoluteFormat',
    defaultFormat: '0.00',
  },
  {
    id: 2,
    label: 'Relative :',
    checkController: 'showRelative',
    formatController: 'relativeFormat',
    defaultFormat: '00.00',
  },
];
function IntegralsPreferences({ nucleus, preferences }, ref) {
  const alert = useAlert();
  const [, setSettingsData] = useStateWithLocalStorage('nmr-general-settings');

  const [settings, setSetting] = useState(null);
  const formRef = useRef();

  useEffect(() => {
    const integralsPreferences = getValueByKeyPath(
      preferences,
      'formatting.panels.integrals',
    );

    if (integralsPreferences) {
      setSetting(integralsPreferences);
    }
  }, [preferences]);

  const saveToLocalStorgate = (values) => {
    setSettingsData(values, 'formatting.panels.integrals');
  };

  const saveHandler = useCallback(
    (values, showMessage = false) => {
      preferences.dispatch({
        type: SET_PANELS_PREFERENCES,
        payload: { key: 'integrals', value: values },
      });
      if (showMessage) {
        alert.success('Integrals preferences saved successfully');
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
      if (settings) {
        const value =
          params[0] === null
            ? settings[params[1]]
            : lodashGet(settings, params.join('.'));
        return value ? value : null;
      } else {
        const keyIndex = params.length - 1;
        return integralDefaultValues[params[keyIndex]];
      }
    },
    [settings],
  );
  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div style={styles.groupContainer}>
          <p style={styles.header}>General</p>
          <ColorInput name="color" value={`${getValue(null, 'color')}`} />
          <NumberInput
            name="strokeWidth"
            label="stroke width :"
            style={{
              label: { fontSize: '11px', fontWeight: 'bold', color: '#232323' },
              input: {
                width: '60%',
                textAlign: 'center',
                borderRadius: '5px',
              },
            }}
            defaultValue={Number(getValue(null, 'strokeWidth'))}
            min={1}
            pattern="[1-9]*"
          />
        </div>

        {nucleus &&
          nucleus.map((nucleusLabel) => (
            <div key={nucleusLabel} style={styles.groupContainer}>
              <p style={styles.header}>
                <MF mf={nucleusLabel} />
              </p>
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

export default IntegralsWrapper(forwardRef(IntegralsPreferences));
